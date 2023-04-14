import axios from "axios";
import { useEffect } from "react";
const Test = () => {
    useEffect(() => {
        // axios.post("/api/meetings", {
        //     attendee_emails: ["aweb5031@gmail.com"], // Array<emails>
        //     start_time: "2023-04-14 22:21:48+00", // UTC format 2023-03-16 22:21:48.819102+00
        //     meeting_title: "testsdfsdf",
        //     meeting_description: "a meeting to test something",
        //     adminEmail: "abhinavbhattarai88@gmail.com",
        // }).then(() => {

        // }).catch(() => {

        // });
        axios.delete("/api/meetings?meeting_id=88995679896")
    }, [])
    return (
        <>
        
        </>
    )
};

export default Test
