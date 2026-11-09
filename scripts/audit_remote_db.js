const url = 'https://rvvwhlyqscxtwyqsvdbx.supabase.co';
const anonKey = 'sb_publishable_k05wogcCpRipnxLlj4nzqA_eruRLKJw';

async function audit() {
  const tables = [
    'services', 'service_categories', 'add_ons', 'service_add_ons',
    'profiles', 'organizations', 'organization_members',
    'package_drafts', 'quotes', 'quote_items', 'orders', 'order_items',
    'payments', 'projects', 'project_briefs', 'project_tasks',
    'project_assets', 'asset_annotations', 'approvals', 'delivery_events',
    'pricing_rules', 'audit_logs'
  ];
  
  const results = {};
  for (const t of tables) {
    try {
      const res = await fetch(`${url}/rest/v1/${t}?limit=1`, {
        headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
      });
      results[t] = { status: res.status, statusText: res.statusText };
      console.log(`Table ${t.padEnd(22)}: HTTP ${res.status} (${res.statusText})`);
    } catch (e) {
      console.log(`Table ${t.padEnd(22)}: Error ${e.message}`);
    }
  }

  // Also check RPC existence
  const rpcs = [
    'create_quotation_request', 'create_pending_order', 'settle_verified_payment',
    'submit_project_brief', 'approve_project_asset'
  ];
  console.log('\n--- RPC Endpoint Audit ---');
  for (const r of rpcs) {
    try {
      const res = await fetch(`${url}/rest/v1/rpc/${r}`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      console.log(`RPC ${r.padEnd(26)}: HTTP ${res.status} (${res.statusText})`);
    } catch (e) {
      console.log(`RPC ${r.padEnd(26)}: Error ${e.message}`);
    }
  }
}

audit();
