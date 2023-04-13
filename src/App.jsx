import { useEffect, useState } from "react";
import {Configuration, OpenAIApi} from "openai";

import "./root.css";

import micIcon from "./Assets/mic.png";

const App = () => {
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
        prompt: promptPreview,
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
    setPromptPreview("");
  };

  const startRecordController = () => {
    if (isRecording) {
      microphone.start();
      microphone.onend = () => {
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
      console.log(promptPreview.length)
      microphone.onerror = () => {};
    };
  };

  useEffect(() => {
    startRecordController();
  }, [isRecording]);

  return (
    <>
      <div className="container">
        {/*AI CONTAINER*/}
        <div className="ai-response-container">
          <form id="prompt-container" onSubmit={handleSubmit}>
            <textarea id="mic-input-area" type="text" spellCheck={false} value={promptPreview} placeholder="..." onChange={(e) => setPromptPreview(e.target.value)}></textarea>
            {apiResponse && (
              <div className="api-response">
                <h3>{apiResponse}</h3>
              </div>
            )}
            {isRecording && promptPreview.length > 0 ? 
              null : 
              <button className="generate-response-button" disabled={loading || promptPreview.length === 0} type="submit">{loading ? "Generating..." : "Generate"}</button>
            }
          </form>
        </div>

        {/*SPEECH TP TEXT*/}
        <div className="speach-to-text-container">
          {isRecording ? 
            <img id="mic-button" className="recording-on" src={micIcon} onClick={() => setisRecording((prevState) => !prevState)} /> :
            <img id="mic-button" className="recording-off" src={micIcon} onClick={() => setisRecording((prevState) => !prevState)} />
          }
        </div>
      </div>
    </>
  );
}

export default App;
