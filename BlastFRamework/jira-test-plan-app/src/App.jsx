import { useState } from 'react'
import Header from './components/Header'
import ConfigForm from './components/ConfigForm'
import TestPlanViewer from './components/TestPlanViewer'
import { fetchJiraTicket } from './api/jira'
import { generateTestPlan } from './api/groq'

export default function App() {
  const [testPlan, setTestPlan]     = useState('')
  const [ticketData, setTicketData] = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [step, setStep]             = useState('')

  const handleGenerate = async (config) => {
    setLoading(true)
    setError('')
    setTestPlan('')
    setTicketData(null)

    try {
      setStep('Connecting to JIRA...')
      const ticket = await fetchJiraTicket(config)
      setTicketData(ticket)

      setStep('Generating IEEE 829 Test Plan with Groq AI...')
      const plan = await generateTestPlan({ groqApiKey: config.groqApiKey, ticket })
      setTestPlan(plan)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setStep('')
    }
  }

  return (
    <div className="min-h-screen font-inter" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #12062b 40%, #061228 100%)' }}>
      <Header />

      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <ConfigForm
              onGenerate={handleGenerate}
              loading={loading}
              step={step}
              error={error}
            />
          </div>
          <div className="lg:col-span-3">
            <TestPlanViewer
              testPlan={testPlan}
              ticketData={ticketData}
              loading={loading}
              step={step}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
