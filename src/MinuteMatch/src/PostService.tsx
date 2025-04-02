function PostService(){
    const API_URL = "this_url_dont_work";
    return (
        <>
        <h1>THIS IS WHERE YOU WOULD POST A SERVICE</h1>
        <form>
            <select name="type">
                <option disabled selected="selected">Select a type</option>
                <option>Test Type 1</option>
                <option>Test Type 2</option>
                <option>Test Type 3</option>
            </select>
            <br/>
            <select name="category">
                <option disabled selected="selected">Select a category</option>
                <option>Test Cat 1</option>
                <option>Test Cat 2</option>
                <option>Test Cat 3</option>
            </select>
            <br/>
            <select name="group">
                <option disabled selected="selected">Select a group</option>
                <option>Test Group 1</option>
                <option>Test Group 2</option>
                <option>Test Group 3</option>
            </select>
            <br/>
            <textarea name="description" placeholder="Description"></textarea>
            <br/>
            <input type="file" name="picture"/>
            <br/>
            <button type="submit" formAction={API_URL}>SUBMIT</button>
        </form>
        </>
    )
}

export default PostService