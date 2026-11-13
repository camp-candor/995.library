export const onRequestGet = async (context) => {
  const authHeader = context.request.headers.get('Authorization');

  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header is missing' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = 'https://worker-warden.berad4000.workers.dev/auth';

  try {
    console.log('Proxying auth verification request to gatekeeper...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`Gatekeeper returned ${response.status}:`, data);
      return new Response(
        JSON.stringify({
          error: 'Gatekeeper verification failed',
          downstreamStatus: response.status,
          details: data,
        }),
        {
          status: response.status, // Pass through the actual status!
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Critical error in auth proxy:', error.message);
    return new Response(
      JSON.stringify({
        error: 'Internal Proxy Error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
