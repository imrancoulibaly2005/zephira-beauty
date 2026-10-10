// Génère shopify/products.csv au format d'import produits Shopify.
// Usage : node scripts/export-shopify.mjs [URL_BASE_IMAGES]
// Ex.   : node scripts/export-shopify.mjs https://monsite.com/photos   (→ <base>/<handle>.jpg)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const { products } = JSON.parse(readFileSync(new URL('../data/products.json', import.meta.url), 'utf8'));
const imageBase = (process.argv[2] || '').replace(/\/$/, '');

const cols = ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker',
  'Variant Inventory Qty', 'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Price',
  'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable', 'Image Src', 'Image Position',
  'Image Alt Text', 'SEO Title', 'SEO Description', 'Status'];

const esc = v => {
  const s = v === undefined || v === null ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const categories = {
  'Lèvres': 'Health & Beauty > Personal Care > Cosmetics > Lip Makeup',
  'Yeux': 'Health & Beauty > Personal Care > Cosmetics > Eye Makeup',
  'Teint': 'Health & Beauty > Personal Care > Cosmetics > Face Makeup',
  'Accessoires': 'Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools',
  'Coffrets': 'Health & Beauty > Personal Care > Cosmetics'
};

const rows = [];
for (const p of products) {
  const body = `<p>${p.description}</p><ul>${p.details.map(d => `<li>${d}</li>`).join('')}</ul>`;
  p.shades.forEach(([name], i) => {
    const first = i === 0;
    rows.push([
      p.handle, first ? p.title : '', first ? body : '', first ? p.vendor : '', first ? categories[p.type] || '' : '',
      first ? p.type : '', first ? p.tags.join(', ') : '', first ? 'TRUE' : '',
      first ? 'Teinte' : '', name, `${p.sku}-${String(i + 1).padStart(2, '0')}`, 100, 'shopify', 50, 'deny', 'manual',
      p.price.toFixed(2), p.compareAt ? p.compareAt.toFixed(2) : '', 'TRUE', 'TRUE',
      first && imageBase ? `${imageBase}/${p.handle}.jpg` : '', first && imageBase ? 1 : '',
      first && imageBase ? p.title : '', first ? p.title : '', first ? p.short : '', first ? 'active' : ''
    ]);
  });
}

mkdirSync(new URL('../shopify/', import.meta.url), { recursive: true });
const csv = '﻿' + [cols, ...rows].map(r => r.map(esc).join(',')).join('\n') + '\n';
writeFileSync(new URL('../shopify/products.csv', import.meta.url), csv);
console.log(`✔ shopify/products.csv : ${products.length} produits, ${rows.length} variantes`);
