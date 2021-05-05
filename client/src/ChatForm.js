import React, { useState } from "react";
const ChatForm = ({ submitData, placeholderText="enter message" }) => {
    const [formData, setFormData] = useState("");
    // controls change in inputs
    const handleChange = (e) => {
        setFormData(e.target.value)
    }
    // submits data and uses passed down function from parent
    const handleSubmit = (e) => {
        e.preventDefault();
        submitData(formData);
        setFormData("");
    }
    return (
        <>
        <form onSubmit={handleSubmit} style={{textAlign: "center"}}>
            {placeholderText === "Room Name" ? 
            <span>
            <input
            style={{width:"25%"}}
            id="message"
            type="text"
            placeholder={placeholderText}
            name="message"
            value={formData}
            onChange={handleChange}               
            />
            <input className="mx-1" type="submit" />
            </span>
            :
            <input
            style={{width:"60%"}}
            id="message"
            type="text"
            placeholder={placeholderText}
            name="message"
            value={formData}
            onChange={handleChange}               
            />        
            }  
        </form>
        </>
    )
};

export default ChatForm;