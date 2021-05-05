import React, { useState } from "react";

const ItemForm = ({ submitForm, room }) => {
    // Initial state of empty strings for inputs
    let INITIAL_STATE = { roomname: room.roomname, thumbnail: room.thumbnail };
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
        submitForm({ ...formData });
        setFormData(INITIAL_STATE);
        // give error if no redirect
        setTimeout(function(){ setWrong(true); }, 500);
    }

    return (
        <section
        style={{ backgroundColor:"rgba(12, 14, 15, 0.7)", margin:"auto", width:"fit-content", padding:"2rem" }}>
            <h3 className="font-weight-bold text-center">
                Edit Room:
            </h3>
            <br></br>
                <form onSubmit={handleSubmit} style={{textAlign: "center"}}>                 
                    <input
                    id="roomname"
                    type="text"
                    placeholder="roomname"
                    name="roomname"
                    value={formData.roomname}
                    onChange={handleChange}               
                    />
                    <br></br>
                    <label htmlFor="thumbnail">Thumbnail URL</label>
                    <br></br> 
                    <input
                    id="thumbnail"
                    type="text"
                    placeholder="thumbnail url"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}               
                    />
                    <br></br>
                    <input type="submit"/>
                    <br></br>
                    {isInvalid && <span style={{color: "red"}}>Prompts must be filled out</span>}
                    {wrong && <span style={{color: "red"}}>Invalid inputs</span>}
                </form>
        </section>
    )
};

export default ItemForm;