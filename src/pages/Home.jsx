import { useState, useEffect } from 'react'  // useState = store data, useEffect = run code at certain times
import { useNavigate } from 'react-router-dom'  // lets us switch between pages
import '../App.css'  // our styling file (../ means go up one folder)

// this function gets today's date as a string like "2026-03-27"
function getTodayDate() {
    return new Date().toISOString().split('T')[0]  // gets current date and removes the time part
}

function Home() {
    const navigate = useNavigate()  // we use this to go to the history page when button is clicked

    // stores the current time so we can show it on screen - updates every second
    const [currentTime, setCurrentTime] = useState(new Date())

    // stores our list of chores
    // when the app loads, it checks localStorage first - if data is saved it uses that, otherwise uses the default list
    const [chores, setChores] = useState(() => {
        const saved = localStorage.getItem('chores')  // try to get saved chores from browser storage
        return saved ? JSON.parse(saved) : [  // if saved data exists use it, otherwise use defaults below
            { id: 1, text: 'Wash dishes', done: false },
            { id: 2, text: 'Hoover living room', done: false },
            { id: 3, text: 'Take out bins', done: false },
        ]
    })

    // stores whatever the user is currently typing in the input box
    const [newChore, setNewChore] = useState('')

    // this function runs at the end of each day
    // it saves the day's progress to history and resets all chores back to not done
    function resetForNewDay(dateToSave) {
        const done = chores.filter(c => c.done).length  // count how many chores were completed
        const total = chores.length  // count total number of chores

        // get existing history from localStorage (or empty array if none exists)
        const history = JSON.parse(localStorage.getItem('history') || '[]')

        // add today's results to the top of the history list including the actual chores
        history.unshift({ date: dateToSave, done, total, chores })  // chores added here
        localStorage.setItem('history', JSON.stringify(history))  // save updated history

        // reset all chores back to not done for the new day
        const resetChores = chores.map(c => ({ ...c, done: false }))
        setChores(resetChores)
        localStorage.setItem('chores', JSON.stringify(resetChores))  // save reset chores
    }

    // this runs ONCE when the app first loads
    // it checks if the user is opening the app on a new day compared to last time
    useEffect(() => {
        const lastOpenedDate = localStorage.getItem('lastOpenedDate')  // when did they last open the app?
        const today = getTodayDate()  // what is today's date?

        if (lastOpenedDate && lastOpenedDate !== today) {
            // it's a new day! save yesterday's progress to history and reset chores
            resetForNewDay(lastOpenedDate)
        }

        // update the last opened date to today
        localStorage.setItem('lastOpenedDate', today)
    }, [])  // the empty [] means this only runs once when the page loads

    // this runs every single second to update the clock
    // it also checks if it's midnight and resets the chores if so
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date()  // get the current time right now
            setCurrentTime(now)  // update the clock shown on screen

            // check if it's exactly midnight (hour 0, minute 0, second 0)
            if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
                // it's midnight! work out what yesterday's date was
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)  // go back one day
                const yesterdayDate = yesterday.toISOString().split('T')[0]

                resetForNewDay(yesterdayDate)  // save yesterday and reset for new day
                localStorage.setItem('lastOpenedDate', getTodayDate())  // update stored date
            }
        }, 1000)  // 1000 milliseconds = 1 second

        return () => clearInterval(interval)  // stops the clock when the component unmounts
    }, [chores])  // re-runs whenever chores change so it always has the latest data

    // saves chores to localStorage every time the chores list changes
    // this is what makes data survive a page refresh
    useEffect(() => {
        localStorage.setItem('chores', JSON.stringify(chores))
    }, [chores])

    // adds a new chore to the list when the Add button is clicked
    function addChore() {
        if (newChore.trim() === '') return  // don't add if input is empty
        setChores([...chores, { id: Date.now(), text: newChore, done: false }])  // add new chore to list
        setNewChore('')  // clear the input box
    }

    // flips a chore between done and not done when the Done/Undo button is clicked
    function toggleDone(id) {
        setChores(chores.map(c => c.id === id ? { ...c, done: !c.done } : c))
        // goes through every chore - if it matches the clicked one, flip its done status
    }

    // removes a chore from the list when the ✕ button is clicked
    function deleteChore(id) {
        setChores(chores.filter(c => c.id !== id))  // keep every chore EXCEPT the clicked one
    }

    // everything below is the UI - what shows up on screen
    return (
        <div className="app">
            <h1>My Chores</h1>

            {/* shows the current date and time - updates every second */}
            <p className="datetime">
                {currentTime.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' — '}
                {currentTime.toLocaleTimeString('en-GB')}
            </p>

            {/* button that takes you to the history page */}
            <button onClick={() => navigate('/history')}>📅 View History</button>

            {/* shows completed chores vs total */}
            <p>{chores.filter(c => c.done).length} of {chores.length} chores done</p>

            {/* input box and add button */}
            <div className="add-chore">
                <input
                    value={newChore}
                    onChange={e => setNewChore(e.target.value)}  // updates newChore as user types
                    placeholder="Add a new chore..."
                />
                <button onClick={addChore}>Add</button>
            </div>

            {/* chore list */}
            <ul>
                {chores.length === 0 ? (
                    // if no chores exist show this message
                    <p>No chores, you're all done! 🎉</p>
                ) : (
                    // otherwise loop through and show each chore
                    chores.map(chore => (
                        <li key={chore.id} className={chore.done ? 'done' : ''}>  {/* adds done class if completed */}
                            <span>{chore.text}</span>
                            <button onClick={() => toggleDone(chore.id)}>
                                {chore.done ? 'Undo' : 'Done'}  {/* switches label based on done status */}
                            </button>
                            <button onClick={() => deleteChore(chore.id)}>✕</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    )
}

export default Home  // makes this component available to App.jsx