import React from "react";

function PlaylistUrl({ url, id, submitDeleteUrl }) {
  return (
    <span>
      <span style={{color:"black"}}>{url}   <button onClick={() => submitDeleteUrl(id)}>   ❌</button></span>
    <hr className="m-0"></hr>
    </span>
  );
}

export default PlaylistUrl;
