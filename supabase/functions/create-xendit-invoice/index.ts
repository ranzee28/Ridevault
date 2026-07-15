// Supabase Edge Function: create-xendit-invoice

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { bookingId, amount, email, bikeName, successUrl, failureUrl } = await req.json();

    if (!bookingId || !amount || !email || !bikeName || !successUrl || !failureUrl) {
      throw new Error('Missing required body parameters: bookingId, amount, email, bikeName, successUrl, failureUrl');
    }

    // Get Xendit secret key from environment variables
    const xenditSecretKey = Deno.env.get('XENDIT_SECRET_KEY');
    if (!xenditSecretKey) {
      throw new Error('XENDIT_SECRET_KEY environment variable is not set in Supabase Edge Functions.');
    }

    // Encode authorization header (Basic Auth) using btoa
    const basicAuth = btoa(xenditSecretKey + ':');

    // Make request to Xendit Invoice API
    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        external_id: bookingId,
        amount: Math.round(amount),
        payer_email: email,
        description: `SEWA MOTOR ${bikeName}`.toUpperCase(),
        success_redirect_url: successUrl,
        failure_redirect_url: failureUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create Xendit invoice, status code: ${response.status}`);
    }

    const invoiceData = await response.json();

    return new Response(
      JSON.stringify({ invoice_url: invoiceData.invoice_url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error creating Xendit invoice:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
