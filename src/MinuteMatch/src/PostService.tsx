function PostService(){
    const API_URL = "this_url_dont_work";
    return (
        <>
        <h1>THIS IS WHERE YOU WOULD POST A SERVICE</h1>
        <form>
            <select name="type" defaultValue="">
                <option value="" disabled>Select a type</option>
                <option value="test1">Test Type 1</option>
                <option value="test2">Test Type 2</option>
                <option value="test3">Test Type 3</option>
            </select>
            <br/>
            <select name="type" defaultValue="">
                <option value="" disabled>Select a category</option>
                <option value="test1">Test Cat 1</option>
                <option value="test2">Test Cat 2</option>
                <option value="test3">Test Cat 3</option>
            </select>
            <br/>
            <select name="type" defaultValue="">
                <option value="" disabled>Select a group</option>
                <option value="test1">Test Group 1</option>
                <option value="test2">Test Group 2</option>
                <option value="test3">Test Group 3</option>
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