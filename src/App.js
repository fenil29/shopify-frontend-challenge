import { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import Skeleton from 'react-loading-skeleton'
import { Configuration, OpenAIApi } from 'openai'

import 'react-loading-skeleton/dist/skeleton.css'
import './App.css'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

function App() {
  const [textPrompt, setTextPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [responses, setResponses] = useState([])
  const [supportedEngines, setSupportedEngines] = useState([])
  const [selectedEngines, setSelectedEngines] = useState('text-curie-001')

  function handleChange(event) {
    setTextPrompt(event.target.value)
  }
  function handleSubmit(event) {
    setIsLoading(true)
    event.preventDefault()
    fetchDataFromOpenAi(textPrompt)
    setTextPrompt('')
  }

  async function fetchDataFromOpenAi(textPrompt) {
    try {
      const completion = await openai.createCompletion(selectedEngines, {
        prompt: textPrompt,
      })
      let temp = [...responses]
      temp.unshift({
        prompt: textPrompt,
        response: completion.data.choices[0].text,
        engine: selectedEngines,
      })
      setResponses(temp)
      saveResponses(temp)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      alert('Something Went Wrong!')
    }
  }
  useEffect(() => {
    loadResponses()
    loadSupportedEngines()
  }, [])
  function saveResponses(responses) {
    localStorage.setItem('responses', JSON.stringify(responses))
  }
  function loadResponses() {
    if (localStorage.getItem('responses')) {
      setResponses(JSON.parse(localStorage.getItem('responses')))
    }
  }
  function clearResponses() {
    saveResponses([])
    setResponses([])
  }
  async function loadSupportedEngines() {
    try {
      const supportedEngines = await openai.listEngines()

      setSupportedEngines(supportedEngines.data.data)
    } catch (error) {
      alert('Something Went Wrong!')
    }
  }
  function handleSelectEngine(e) {
    let { value } = e.target
    setSelectedEngines(value)
  }
  return (
    <div className="applicaion-container">
      <h1>Fun with AI</h1>
      {supportedEngines.length === 0 ? (
        <ReactLoading type={'spin'} color={'#004c3f'} height={20} width={20} />
      ) : (
        <select name="engine" id="engine" onChange={handleSelectEngine}>
          {supportedEngines.map((engine) => (
            <option value={engine.id} selected={engine.id === 'text-curie-001'}>
              {engine.id}
            </option>
          ))}
        </select>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <label>
            <p>Enter Prompt:</p>
            <textarea value={textPrompt} onChange={handleChange} />
            <div className="button-container">
              <button type="submit" value="Submit">
                Submit
              </button>
            </div>
          </label>
        </form>
      </div>
      {responses.length > 0 && (
        <div className="clear-button-container">
          <button onClick={clearResponses}>Clear</button>
        </div>
      )}

      {isLoading && <Skeleton count={1} />}
      {responses.map((response, index) => (
        <div key={index} className="response-container">
          <h2>Prompt:</h2>
          <p>{response.prompt}</p>
          <h2>Response:</h2>
          <p>{response.response}</p>
          <h2>Engine:</h2>
          <p>{response.engine}</p>
        </div>
      ))}
    </div>
  )
}

export default App
