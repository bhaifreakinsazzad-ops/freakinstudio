const url = 'https://rvvwhlyqscxtwyqsvdbx.supabase.co';
const anonKey = 'sb_publishable_k05wogcCpRipnxLlj4nzqA_eruRLKJw';

async function checkCounts() {
  const counts = {};
  
  // Services
  let res = await fetch(`${url}/rest/v1/services?select=id`, {
    headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
  });
  let data = await res.json();
  counts.services = Array.isArray(data) ? data.length : data;

  // Categories
  res = await fetch(`${url}/rest/v1/service_categories?select=id`, {
    headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
  });
  data = await res.json();
  counts.categories = Array.isArray(data) ? data.length : data;

  // Add-ons
  res = await fetch(`${url}/rest/v1/add_ons?select=id`, {
    headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
  });
  data = await res.json();
  counts.add_ons = Array.isArray(data) ? data.length : data;

  // Service Add-ons
  res = await fetch(`${url}/rest/v1/service_add_ons?select=service_id`, {
    headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
  });
  data = await res.json();
  counts.service_add_ons = Array.isArray(data) ? data.length : data;

  console.log('Catalog Counts in Remote DB:');
  console.log(JSON.stringify(counts, null, 2));
}

checkCounts();
