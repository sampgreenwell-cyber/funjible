import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')

  const API_URL = 'http://localhost:3000/api'

  const handleAuth = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const body = isLogin 
        ? { email, password }
        : { email, password, firstName, lastName }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('token', data.data.token)
        setUser(data.data.user)
        setMessage(`Welcome, ${data.data.user.firstName}!`)
      } else {
        setMessage(data.error || 'Authentication failed')
      }
    } catch (error) {
      setMessage('Error connecting to server')
      console.error(error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setMessage('Logged out successfully')
  }

  if (user) {
    return (
      <div className="App">
        <div className="card">
          <h1>🎉 Welcome to NewsAccess!</h1>
          <div className="user-info">
            <h2>Hello, {user.firstName} {user.lastName}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
          <div className="features">
            <h3>Available Features:</h3>
            <ul>
              <li>✅ User Authentication</li>
              <li>✅ Digital Wallet (Coming Soon)</li>
              <li>✅ Article Purchases (Coming Soon)</li>
              <li>✅ Publisher Subscriptions (Coming Soon)</li>
            </ul>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <div className="card">
        <h1>📰 NewsAccess</h1>
        <p className="tagline">Pay only for the articles you read</p>
        
        <div className="auth-toggle">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleAuth}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        {message && (
          <p className={`message ${user ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default App