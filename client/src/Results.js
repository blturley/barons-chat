import React, { useState, useEffect, useContext } from "react";
import ChatForm from "./ChatForm";
import Api from "./api";
import { useJwt } from "react-jwt";
import TokenContext from "./TokenContext";

function Results({ type }) {
  const token = useContext(TokenContext);
  const { decodedToken } = useJwt(token);
  const [results, setResults] = useState([]);
  const [userData, setUserData] = useState();
  Api.token = token;

  async function getUserData() {
      let data = await Api.getUser(decodedToken.username);
      setUserData(data);
    }

  useEffect(() => {
    if (decodedToken) getUserData();
  }, [decodedToken]);

  useEffect(() => {
    setResults([]);
  }, [type]);

  async function updateResults(formData){

    let str = '?';
    for (let key in formData) {
      if (formData[key]) str += `${key}=${formData[key]}&`;
    };
    await getUserData();
    const res = type === "jobs" ? await Api.getJobs(str) : await Api.getCompanies(str);
    setResults(res);
  };

  if (!userData) {
    return <div style={{textAlign: "center"}}><h1 style={{color: "white"}}>Loading...</h1></div>;
  }

  return (
    <>
    <ChatForm submitResults={updateResults} type={type} />
    <section>
    </section>
    </>
  );
}

export default Results;
