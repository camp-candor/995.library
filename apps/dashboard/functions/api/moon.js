export const onRequestGet = async () => {
  var queryFn = async () => {
    const response = await fetch('https://zero01-mythos-tattoo.onrender.com/api/mythos/status');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  };

  console.log('the moon is going down ');

  console.log('the sun is going up ');

  const bit = await queryFn();

  return new Response(JSON.stringify(bit));
};
