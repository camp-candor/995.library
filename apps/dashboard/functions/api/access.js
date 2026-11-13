export const onRequestGet = async (context) => {
  // 1. Get the Authorization header from the incoming request.
  const authHeader = context.request.headers.get('Authorization');

  // 2. Check if the header exists. If not, return an error response.
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Authorization header is missing' }), {
      status: 401, // Unauthorized
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // The 'authHeader' will be the full string, e.g., "Bearer eyJhbGciOiJSUz..."

  // Define the function to fetch data.
  const queryFn = async () => {
    const url = 'https://tasou-system.onrender.com/api/access/read';

    console.log('fetching... ' + url);

    // 3. Make the fetch request to the downstream API, including the captured header.
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Pass the original Authorization header along to the next service.
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Downstream API error! Status: ${response.status}`);
    }

    return response.json();
  };

  try {
    console.log('get request from access read');

    const bit = await queryFn();

    // 4. Return the successful response from the downstream API to the original caller.
    return new Response(JSON.stringify(bit), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle errors from the fetch call.
    console.error('Error in onRequestGet:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch from downstream service' }), {
      status: 502, // Bad Gateway
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
