import React, { useState } from "react";

const ItemForm = ({ submitForm, type, user={} }) => {
    // Initial state of empty strings for inputs
    let INITIAL_STATE;
    if (type === "login") INITIAL_STATE = { username: "", password: "" };
    if (type === "signup") INITIAL_STATE = { username: "", password: "", email: "" };
    if (type === "update") INITIAL_STATE = { username: user.username, email: user.email, avatar: user.avatar };
    if (type === "room") INITIAL_STATE = { nickname: user.nickname, namecolor: user.namecolor };
    // form data object
    const [formData, setFormData] = useState(INITIAL_STATE);
    // displays error message if prompts not filled out
    const [isInvalid, setIsInvalid] = useState(false);
    const [wrong, setWrong] = useState(false);
    // controls change in inputs
    const handleChange = (e) => {
        const { name, value } = e.target.type === "checkbox" ? 
        {name: e.target.name, value: e.target.checked} : e.target; 
        setFormData(formData => ({
            ...formData,
            [name]: value
        }))
    }
    // submits data and uses passed down function from parent
    const handleSubmit = (e) => {
        e.preventDefault();
        // checks for empty inputs and sets invalid if found
        if (Object.values(formData).includes("")) {
            setIsInvalid(true);
            return;
        }
        // passed down function for submitting form
        submitForm({ ...formData }, type);
        setFormData(INITIAL_STATE);
        // give error if no redirect
        setTimeout(function(){ setWrong(true); }, 500);
    }

    return (
        <section
        style={{ backgroundColor:"rgba(12, 14, 15, 0.7)", margin:"auto", width:"fit-content", padding:"2rem" }}>
            <h3 className="font-weight-bold text-center">
                {`${type}:`}
            </h3>
            <br></br>
                <form onSubmit={handleSubmit} style={{textAlign: "center"}}>
                    {type !== "room" &&
                    <span>
                    <input
                    id="username"
                    type="text"
                    placeholder="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}               
                    />
                    <br></br>
                    </span>
                    }                 
                    {(type === "login" || type === "signup") &&
                    <span>
                    <input
                    id="password"
                    type="text"
                    placeholder="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}               
                    />
                    <br></br>
                    </span>
                    }   
                    {(type === "signup" || type === "update") &&
                    <span>
                    <input
                    id="email"
                    type="text"
                    placeholder="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    />
                    <br></br>
                    </span> }
                    { type === "update" &&
                    <span>
                    <label htmlFor="avatar">Avatar URL</label>
                    <br></br>
                    <input
                    id="avatar"
                    type="text"
                    placeholder="avatar url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}               
                    />
                    <br></br>
                    </span> }
                    { type === "room" &&
                    <span>
                    <label htmlFor="nickname">Nickname</label>
                    <br></br>
                    <input
                    id="nickname"
                    type="text"
                    placeholder="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}               
                    />
                    <br></br>
                    <label htmlFor="namecolor">Name Color</label>
                    <br></br>
                    <input
                    id="namecolor"
                    type="color"
                    name="namecolor"
                    value={formData.namecolor}
                    onChange={handleChange}               
                    />
                    <br></br>
                    </span> }
                    <input type="submit"/>
                    <br></br>
                    {isInvalid && <span style={{color: "red"}}>Prompts must be filled out</span>}
                    {wrong && <span style={{color: "red"}}>Invalid inputs</span>}
                </form>
        </section>
    )
};

export default ItemForm;