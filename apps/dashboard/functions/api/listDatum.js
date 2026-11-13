export const onRequestGet = async () => {
  var queryFn = async () => {
    const response = await fetch('https://zero01-mythos-tattoo.onrender.com/api/datum/list');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    var dat = response.json();

    console.log('the datum is going up ' + JSON.stringify(dat));

    return dat;
  };

  const bit = await queryFn();

  return new Response(JSON.stringify(bit));
};
