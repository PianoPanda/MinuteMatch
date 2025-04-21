import React from "react";
import "./PostRequestService.css"; // Ensure CSS file name is correct

const RequestService: React.FC = () => {
    // Implementation of the express code to connect to the postgreSQL database
    



    return (
        <div className="form-container">
            <h1 className="form-title">Request a Service</h1>
            <form>
                <div className="form-group">
                    <label htmlFor="type">Select a Type</label>
                    <select name="type" defaultValue="">
                        <option value="" disabled>Select a type</option>
                        <option value="test1">Test Type 1</option>
                        <option value="test2">Test Type 2</option>
                        <option value="test3">Test Type 3</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="category">Select a Category</label>
                    <select name="category" defaultValue="">
                        <option value="" disabled>Select a category</option>
                        <option value="test1">Test Cat 1</option>
                        <option value="test2">Test Cat 2</option>
                        <option value="test3">Test Cat 3</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="group">Select a Group</label>
                    <select name="group" defaultValue="">
                        <option value="" disabled>Select a group</option>
                        <option value="test1">Test Group 1</option>
                        <option value="test2">Test Group 2</option>
                        <option value="test3">Test Group 3</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Request Description</label>
                    <textarea name="description" placeholder="Describe the service you're requesting"></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="picture">Upload Supporting Documents</label>
                    <input type="file" name="picture" />
                </div>

                <div className="form-group">
                    <button type="submit">SUBMIT</button>
                </div>
            </form>
        </div>
    );
};

export default RequestService;