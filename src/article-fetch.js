'use strict';

const net = require('node:net');
const { fetchPage } = require('./net');

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  middot: '·',
  copy: '©',
  reg: '®',
  times: '×'
};

function decodeEntities(value) {
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(Number(dec));
      } catch {
        return '';
      }
    })
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

function stripTags(html) {
  return decodeEntities(
    String(html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|section|h[1-6]|tr)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function metaContent(html, names) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const key = /(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    if (!key || !names.includes(key)) continue;
    const content = /content\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1];
    if (content) return decodeEntities(content).trim();
  }
  return '';
}

function isPrivateHost(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (!net.isIP(host)) return false;
  if (host === '::1' || host === '::' || host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd')) return true;
  if (host.startsWith('127.') || host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('169.254.')) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(host)) return true;
  return false;
}

function cleanTitle(value) {
  return stripTags(value)
    .replace(/\s*[-_|｜]\s*[^-_|｜]{0,24}$/u, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

const BOILERPLATE = /(版权所有|免责声明|转载请注明|扫码|二维码|关注公众号|下载客户端|广告|登录后|点击查看|相关阅读|热门推荐|猜你喜欢|责任编辑|来源[:：])/;

function usefulParagraph(text) {
  if (!text) return false;
  if (text.length < 18 || text.length > 800) return false;
  if (BOILERPLATE.test(text)) return false;
  if (/^[|｜\-—_=·\s]+$/.test(text)) return false;
  return true;
}

function extractParagraphs(html) {
  const paragraphs = [];
  const matches = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const raw of matches) {
    const text = stripTags(raw);
    if (usefulParagraph(text) && !paragraphs.includes(text)) paragraphs.push(text);
  }
  if (!paragraphs.length) {
    for (const line of stripTags(html).split('\n')) {
      const text = line.trim();
      if (usefulParagraph(text) && !paragraphs.includes(text)) paragraphs.push(text);
    }
  }
  return paragraphs.slice(0, 60);
}

function mainHtml(html) {
  let body = html;
  const article = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(html);
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html);
  if (article && article[1].length > 400) body = article[1];
  else if (main && main[1].length > 400) body = main[1];
  return body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|iframe|svg|nav|header|footer|aside|form|button)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
}

function buildSections(html) {
  const heads = [...html.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({
    index: m.index,
    end: m.index + m[0].length,
    title: stripTags(m[2])
  }));

  if (!heads.length) {
    const paragraphs = extractParagraphs(html);
    if (!paragraphs.length) return [];
    return [{ h: '正文', p: paragraphs.slice(0, 14) }];
  }

  const sections = [];
  const intro = extractParagraphs(html.slice(0, heads[0].index));
  if (intro.length) sections.push({ h: '导语', p: intro.slice(0, 3) });

  heads.forEach((head, i) => {
    const next = heads[i + 1]?.index ?? html.length;
    const chunk = html.slice(head.end, next);
    const paragraphs = extractParagraphs(chunk);
    if (head.title && paragraphs.length) {
      sections.push({ h: head.title.slice(0, 60), p: paragraphs.slice(0, 8) });
    }
  });

  return sections.slice(0, 10);
}

function extractTitle(html, fallback) {
  const og = metaContent(html, ['og:title', 'twitter:title']);
  if (og) return cleanTitle(og).slice(0, 60);
  const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  if (h1) {
    const text = cleanTitle(h1[1]);
    if (text) return text.slice(0, 60);
  }
  const title = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (title) {
    const text = cleanTitle(title[1]);
    if (text) return text.slice(0, 60);
  }
  return fallback.slice(0, 60);
}

async function fetchArticle(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || '').trim());
  } catch {
    throw new Error('请填写正确的文章链接');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('只支持 http / https 链接');
  if (isPrivateHost(url.hostname)) throw new Error('该链接地址不被支持');

  const page = await fetchPage(url.href);
  if (page.status < 200 || page.status >= 300) {
    throw new Error(`目标页面返回 ${page.status}，暂时无法抓取`);
  }
  if (page.contentType && !/text\/html|text\/plain/i.test(page.contentType)) {
    throw new Error('该链接不是网页文章');
  }

  const html = mainHtml(page.html);
  const sections = buildSections(html);
  const paragraphCount = sections.reduce((sum, s) => sum + s.p.length, 0);
  if (!sections.length || paragraphCount < 2) {
    throw new Error('未能识别正文内容，可能是动态页面或需要登录，请手动摘录');
  }

  const title = extractTitle(page.html, url.hostname.replace(/^www\./, ''));
  const summaryRaw =
    metaContent(page.html, ['og:description', 'description', 'twitter:description']) ||
    sections.flatMap((s) => s.p)[0] ||
    '';
  const summary = summaryRaw.replace(/\s+/g, ' ').slice(0, 140);
  const totalChars = sections.reduce((sum, s) => sum + s.p.join('').length, 0);

  return {
    title,
    summary,
    tag: '网络摘录',
    minutes: Math.min(20, Math.max(1, Math.round(totalChars / 400))),
    sections,
    sourceUrl: page.url
  };
}

module.exports = { fetchArticle, isPrivateHost, stripTags };
