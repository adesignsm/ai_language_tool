import { useEffect, useState } from "react";
import {Configuration, OpenAIApi} from "openai";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const [isRecording, setisRecording] = useState(false);
  const [promptPreview, setPromptPreview] = useState("");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const microphone = new SpeechRecognition();

  microphone.continuous = true;
  microphone.interimResults = true;
  microphone.lang = "en-US";

  const configuration = new Configuration({
    organization: "org-LZLb4C4BSZ7wxTFbpHNRIX8R",
    apiKey: process.env.REACT_APP_OPEN_AI_KEY,
  });

  const openai = new OpenAIApi(configuration);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.3,
        max_tokens: 1000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });
      setApiResponse(result.data.choices[0].text);
    } catch (e) {
      setApiResponse("Oopss hexstudio is having issues with openai :(.");
    }
    setLoading(false);
  };

  const startRecordController = () => {
    if (isRecording) {
      microphone.start();
      microphone.onend = () => {
        // console.log("continue..");
        microphone.start();
      };
    } else {
      microphone.stop();
      microphone.onend = () => {};
    }
    microphone.onstart = () => {};
  
    microphone.onresult = (event) => {
      const recordingResult = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      setPromptPreview(recordingResult);
      microphone.onerror = (event) => {
        console.log(event.error);
      };
    };
  };

  useEffect(() => {
    startRecordController();
    if (window.innerWidth > 690) alert("Only accessible on mobile");
  }, [isRecording]);

  return (
    <>
      <div className="container">
        {/*AI CONTAINER*/}
        <div className="ai-response-container">
          <form onSubmit={handleSubmit}>
            <textarea type="text" value={promptPreview} placeholder="Speak and you shall see" onChange={(e) => setPrompt(e.target.value)}></textarea>
            <button disabled={loading || promptPreview.length === 0} type="submit">
              {loading ? "Generating..." : "Generate"}
            </button>
          </form>
        </div>
        {apiResponse && (
          <div>
            <h3>{apiResponse}</h3>
          </div>
        )}

        {/*SPEECH TP TEXT*/}
        <div>
          <div className="sppech-to-text-container">
            {isRecording ? <span>Recording... </span> : <span>Stopped </span>}
            <button onClick={() => setisRecording((prevState) => !prevState)}>
              Start/Stop
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
