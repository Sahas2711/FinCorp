import { useEffect, useMemo, useRef, useState } from 'react'

const PIPELINE_STEPS = [
  'Input',
  'Preprocessing',
  'Feature Extraction',
  'Classification',
  'Clustering',
  'Generative AI',
  'Agentic AI',
]

const MODEL_LAYERS = [
  {
    id: 'classification',
    title: 'Best Classification Model',
    model: 'XGBoost Sentinel',
    accuracy: 94.8,
    dataset: 'Customer behavior dataset (120k rows, 48 features)',
    keyMetrics: [
      { label: 'Precision', value: 93 },
      { label: 'Recall', value: 91 },
      { label: 'F1 Score', value: 92 },
    ],
    metric: 'Accuracy 94.8%',
    role: 'Identifies risk labels from multimodal feature vectors with calibrated confidence.',
    isBest: true,
  },
  {
    id: 'clustering',
    title: 'Best Clustering Model',
    model: 'KMeans Spectrum',
    accuracy: 71.0,
    dataset: 'Transaction segments dataset (70k rows, normalized)',
    keyMetrics: [
      { label: 'Silhouette', value: 71 },
      { label: 'Cluster Stability', value: 79 },
      { label: 'Separation', value: 74 },
    ],
    metric: 'Silhouette 0.71',
    role: 'Detects hidden behavior segments and anomaly neighborhoods.',
    isBest: false,
  },
  {
    id: 'generative',
    title: 'Best Generative Model',
    model: 'SynthText 12B',
    accuracy: 90.0,
    dataset: 'Domain instruction tuning set (2.4M examples)',
    keyMetrics: [
      { label: 'Groundedness', value: 88 },
      { label: 'Relevance', value: 92 },
      { label: 'Readability', value: 94 },
    ],
    metric: 'Human score 4.5 / 5',
    role: 'Converts outputs into concise narrative insights and recommendations.',
    isBest: false,
  },
  {
    id: 'agentic',
    title: 'Agentic AI Layer',
    model: 'Orchestrator Agent',
    accuracy: 89.0,
    dataset: 'Workflow traces + action logs (380k sequences)',
    keyMetrics: [
      { label: 'Task Completion', value: 89 },
      { label: 'Safety Checks', value: 96 },
      { label: 'Latency Score', value: 82 },
    ],
    metric: 'Task completion 89%',
    role: 'Chooses and executes the next action plan using model consensus.',
    isBest: false,
  },
]

const STEP_OUTPUTS = [
  'Input validated and normalized for downstream processing.',
  'Noise reduction and missing value handling completed.',
  'Feature vectors extracted from uploaded data.',
  'Classification identified risk: High-Risk Pattern (94%).',
  'Clustering assigned sample to Segment B anomaly group.',
  'Generative AI produced concise explanation narrative.',
  'Agentic AI generated actionable mitigation plan.',
]

function App() {
  const [inputType, setInputType] = useState('Text')
  const [selectedModelId, setSelectedModelId] = useState('')
  const [activeTab, setActiveTab] = useState('Home')
  const [activeStep, setActiveStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [logs, setLogs] = useState([
    '[system] Control room ready.',
    '[hint] Upload data and run pipeline to start live execution.',
  ])
  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewType, setPreviewType] = useState('none')
  const [previewContent, setPreviewContent] = useState('')
  const [liveOutputs, setLiveOutputs] = useState([])
  const [showResultExplain, setShowResultExplain] = useState(false)

  const timerRef = useRef(null)
  const objectUrlRef = useRef(null)
  const uploadCardRef = useRef(null)
  const modelCardRef = useRef(null)
  const resultsCardRef = useRef(null)
  const pipelineCardRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const progress = useMemo(() => {
    if (hasRun) {
      return 100
    }
    if (activeStep < 0) {
      return 0
    }
    return Math.round(((activeStep + 1) / PIPELINE_STEPS.length) * 100)
  }, [activeStep, hasRun])

  const selectedModel = useMemo(
    () => MODEL_LAYERS.find((layer) => layer.id === selectedModelId),
    [selectedModelId],
  )

  const classificationReady = activeStep >= 3 || hasRun
  const clusteringReady = activeStep >= 4 || hasRun
  const generationReady = activeStep >= 5 || hasRun

  const appendLog = (entry) => {
    setLogs((current) => [...current, entry].slice(-12))
  }

  const scrollToSection = (tab) => {
    setActiveTab(tab)

    const sectionMap = {
      Home: pipelineCardRef,
      Upload: uploadCardRef,
      Models: modelCardRef,
      Results: resultsCardRef,
    }

    const targetRef = sectionMap[tab]
    targetRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const appendOutput = (stepIndex) => {
    if (stepIndex < 0 || stepIndex >= STEP_OUTPUTS.length) {
      return
    }

    setLiveOutputs((current) => {
      if (current.some((item) => item.stepIndex === stepIndex)) {
        return current
      }

      return [...current, { stepIndex, text: STEP_OUTPUTS[stepIndex] }]
    })
  }

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }

    setUploadedFile(file)
    appendLog(`[upload] ${file.name} received (${(file.size / 1024).toFixed(1)} KB).`)

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      objectUrlRef.current = url
      setPreviewType('image')
      setPreviewContent(url)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const content = String(reader.result ?? '')
      setPreviewType('text')
      setPreviewContent(content.slice(0, 360) || 'File loaded, but no previewable text found.')
    }
    reader.readAsText(file)
  }

  const runPipeline = () => {
    if (isRunning) {
      return
    }

    if (timerRef.current) {
      window.clearInterval(timerRef.current)
    }

    setIsRunning(true)
    setHasRun(false)
    setActiveStep(0)
    setLiveOutputs([])
    setShowResultExplain(false)
    setLogs([
      '[system] Initializing AI decision flow...',
      `[control] Input=${inputType} | Model=${selectedModel?.model ?? 'None'}`,
      '[engine] Stage 1 started: Input validation.',
    ])
    appendOutput(0)

    let step = 0
    timerRef.current = window.setInterval(() => {
      step += 1

      if (step >= PIPELINE_STEPS.length) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
        setIsRunning(false)
        setHasRun(true)
        setActiveStep(PIPELINE_STEPS.length - 1)
        appendOutput(PIPELINE_STEPS.length - 1)
        setLogs((current) => [
          ...current,
          '[agent] Action plan generated with confidence guardrails.',
          '[done] Pipeline execution completed successfully.',
        ])
        return
      }

      appendOutput(step - 1)
      setActiveStep(step)
      appendLog(`[engine] Stage ${step + 1}: ${PIPELINE_STEPS[step]} in progress...`)
    }, 850)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">AI</div>
            <p className="text-base font-semibold text-cyan-300">Pipeline Vision</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm text-slate-200">
            U
          </div>
        </div>
      </header>

      <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-56 overflow-y-auto border-r border-slate-800 bg-slate-900 p-4 lg:block">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Navigation</h2>
        <nav className="mt-4 space-y-2">
          {['Home', 'Upload', 'Models', 'Results'].map((item) => {
            const isActive = activeTab === item
            return (
              <button
                key={item}
                type="button"
                onClick={() => scrollToSection(item)}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                    : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600'
                }`}
              >
                {item}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="pt-20 lg:pl-56">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
          <div className="mb-6 grid gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm lg:hidden">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Navigation</h2>
            <div className="grid grid-cols-2 gap-2">
              {['Home', 'Upload', 'Models', 'Results'].map((item) => {
                const isActive = activeTab === item
                return (
                  <button
                    key={item}
                      type="button"
                      onClick={() => scrollToSection(item)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                        : 'border-slate-700 bg-slate-800 text-slate-200'
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          <section className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <article ref={uploadCardRef} className="min-h-40 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-cyan-300">Input Upload Card</h2>
                <p className="mt-1 text-sm text-slate-300">Upload image or text dataset before execution.</p>
                <div className="mt-4">
                  <label className="inline-block cursor-pointer rounded-md border border-cyan-400/50 bg-slate-800 px-4 py-2 text-sm text-cyan-100">
                    Choose File
                    <input
                      type="file"
                      accept="image/*,.txt,.csv,.json"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {!uploadedFile ? (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300">
                    Upload data to begin
                  </div>
                ) : (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-800 p-3">
                    <p className="text-xs uppercase text-slate-400">{uploadedFile.name}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB | {uploadedFile.type || 'unknown'}
                    </p>
                    {previewType === 'image' ? (
                      <img src={previewContent} alt="Uploaded preview" className="mt-3 h-36 w-full rounded-md object-cover" />
                    ) : (
                      <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap rounded-md border border-slate-700 bg-slate-900 p-3 text-xs text-slate-200">
                        {previewContent || 'Preview unavailable for this file type.'}
                      </pre>
                    )}
                  </div>
                )}
              </article>

              <article ref={modelCardRef} className="min-h-40 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-cyan-300">Model Selection Card</h2>
                <p className="mt-1 text-sm text-slate-300">Select input type and model to run.</p>
                <div className="mt-4 grid gap-3">
                  <label className="text-sm text-slate-300">
                    Input Type
                    <select
                      value={inputType}
                      onChange={(event) => setInputType(event.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                    >
                      <option>Text</option>
                      <option>Image</option>
                      <option>Hybrid</option>
                    </select>
                  </label>
                  <label className="text-sm text-slate-300">
                    Model
                    <select
                      value={selectedModelId}
                      onChange={(event) => setSelectedModelId(event.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                    >
                      <option value="">Select a model</option>
                      {MODEL_LAYERS.map((layer) => (
                        <option key={layer.id} value={layer.id}>
                          {layer.model}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={runPipeline}
                    disabled={isRunning}
                    className="rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-2">
                      {isRunning ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                      ) : null}
                      {isRunning ? 'Running Pipeline...' : 'Run Model'}
                    </span>
                  </button>
                </div>
              </article>
            </div>

            <article ref={pipelineCardRef} className="min-h-48 overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-900 p-4 shadow-sm">
              <h2 className="text-xl font-semibold text-cyan-300">Pipeline Visualization</h2>
              <p className="mt-1 text-sm text-slate-300">Connected real-time flow with active and completed states.</p>
              <div className="mt-4 overflow-x-auto pb-2">
                <div className="inline-flex min-w-max items-center gap-2">
                  {PIPELINE_STEPS.map((step, index) => {
                    const isDone = activeStep > index || hasRun
                    const isActive = activeStep === index && isRunning
                    const status = isActive ? 'Processing...' : isDone ? 'Completed' : 'Waiting'

                    return (
                      <div key={step} className="inline-flex items-center gap-2">
                        <div
                          className={`pipeline-step rounded-md border px-3 py-2 text-center ${
                            isActive
                              ? 'active border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-100'
                              : isDone
                                ? 'done border-cyan-400 bg-cyan-500/15 text-cyan-100'
                                : 'border-slate-700 bg-slate-800 text-slate-300'
                          }`}
                        >
                          <p className="text-xs font-semibold">{step}</p>
                          <p className="mt-1 text-[11px] opacity-90">{status}</p>
                        </div>
                        {index < PIPELINE_STEPS.length - 1 ? (
                          <div
                            className={`pipeline-arrow text-lg ${
                              isDone ? 'completed' : isActive ? 'active' : ''
                            }`}
                          >
                            {'>'}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </article>

            <div className="grid gap-6 md:grid-cols-2">
              <article ref={resultsCardRef} className="min-h-40 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-cyan-300">Results Card</h2>
                <p className="mt-1 text-sm text-slate-300">Data-driven outputs with confidence and visual indicators.</p>

                {isRunning ? (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-800 p-3 text-sm text-slate-200">
                    Processing results...
                  </div>
                ) : null}

                {!hasRun && !isRunning ? (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300">
                    Run model to generate insights
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <article className="result-card rounded-lg border border-slate-700 bg-slate-800 p-3 transition">
                      <p className="text-xs uppercase text-slate-400">[CLS] Classification</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">
                        {classificationReady ? 'High-Risk Pattern' : 'Pending stage completion'}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        Confidence: {classificationReady ? '94%' : '--'}
                      </p>
                      <div className="mt-2 h-2 rounded-full bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-cyan-400 transition-all duration-500"
                          style={{ width: classificationReady ? '94%' : '12%' }}
                        />
                      </div>
                    </article>

                    <article className="result-card rounded-lg border border-slate-700 bg-slate-800 p-3 transition">
                      <p className="text-xs uppercase text-slate-400">[CLT] Clustering</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">
                        {clusteringReady ? 'Segment B' : 'Awaiting clustering stage'}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        {clusteringReady ? 'Category: Anomaly responders' : 'Group: --'}
                      </p>
                      <div className="mt-2 flex gap-1">
                        {[42, 72, 58, 81].map((height, index) => (
                          <div key={height + index} className="w-2 rounded bg-cyan-400/80" style={{ height: `${height / 4}px` }} />
                        ))}
                      </div>
                    </article>

                    <article className="result-card rounded-lg border border-slate-700 bg-slate-800 p-3 transition sm:col-span-2">
                      <p className="text-xs uppercase text-slate-400">[GEN] Generated Output</p>
                      <p className="mt-1 text-sm text-slate-200">
                        {generationReady
                          ? 'Risk trend is rising. Recommend autoscale policy and proactive incident routing for Region-2.'
                          : 'Generated explanation will appear after generative stage.'}
                      </p>
                      <div className="mt-2 h-10 rounded-md border border-slate-700 bg-slate-900/80" />
                    </article>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setShowResultExplain((prev) => !prev)}
                    className="rounded-md border border-cyan-400/50 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                  >
                    Explain Result
                  </button>
                  <p className="text-xs text-slate-400">Status: {isRunning ? 'Live execution' : hasRun ? 'Completed' : 'Idle'}</p>
                </div>

                {showResultExplain ? (
                  <div className="mt-3 rounded-md border border-slate-700 bg-slate-800 p-3 text-sm text-slate-200">
                    Confidence is derived from classifier probability calibration and validated against cluster stability.
                    Generated explanation is grounded on pipeline intermediate outputs.
                  </div>
                ) : null}

                <div className="mt-4 rounded-md border border-slate-700 bg-slate-800 p-3">
                  <p className="text-xs uppercase text-slate-400">Pipeline Live Output</p>
                  {liveOutputs.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-300">Waiting for intermediate outputs...</p>
                  ) : (
                    <div className="mt-2 max-h-28 space-y-2 overflow-auto text-sm text-slate-200">
                      {liveOutputs.map((item) => (
                        <p key={item.stepIndex} className="rounded border border-slate-700 bg-slate-900 px-2 py-1">
                          {PIPELINE_STEPS[item.stepIndex]}: {item.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 max-h-36 overflow-auto rounded-md border border-slate-700 bg-slate-900 p-3 font-mono text-xs text-emerald-300">
                  {logs.length > 0 ? logs.map((line, index) => <p key={`${line}-${index}`}>{line}</p>) : <p>No logs available.</p>}
                </div>
              </article>

              <article className="min-h-40 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-cyan-300">Model Info Card</h2>
                <p className="mt-1 text-sm text-slate-300">Model profile, training context, and key performance metrics.</p>
                {isRunning ? (
                  <div className="mt-4 space-y-2">
                    <div className="h-11 animate-pulse rounded-md border border-slate-700 bg-slate-800" />
                    <div className="h-11 animate-pulse rounded-md border border-slate-700 bg-slate-800" />
                    <div className="h-11 animate-pulse rounded-md border border-slate-700 bg-slate-800" />
                  </div>
                ) : !selectedModel ? (
                  <div className="mt-4 rounded-md border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300">
                    Select a model to view details
                  </div>
                ) : (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="rounded-md border border-slate-700 bg-slate-800 p-3">
                      <p className="text-xs uppercase text-slate-400">Model Name</p>
                      <p className="mt-1 text-slate-100">{selectedModel.model}</p>
                      {selectedModel.isBest ? (
                        <span className="mt-2 inline-flex rounded-full border border-cyan-400/60 bg-cyan-500/20 px-2 py-0.5 text-[11px] text-cyan-100">
                          Best-performing model
                        </span>
                      ) : null}
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-800 p-3">
                      <p className="text-xs uppercase text-slate-400">Accuracy</p>
                      <p className="mt-1 text-emerald-300">{selectedModel.accuracy.toFixed(1)}%</p>
                      <div className="mt-2 h-2 rounded-full bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-emerald-400 transition-all duration-500"
                          style={{ width: `${selectedModel.accuracy}%` }}
                        />
                      </div>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-800 p-3">
                      <p className="text-xs uppercase text-slate-400">Training Dataset</p>
                      <p className="mt-1 text-slate-200">{selectedModel.dataset}</p>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-800 p-3">
                      <p className="text-xs uppercase text-slate-400">Key Metrics</p>
                      <div className="mt-2 space-y-2">
                        {selectedModel.keyMetrics.map((metric) => (
                          <div key={metric.label}>
                            <div className="flex items-center justify-between text-xs text-slate-300">
                              <span>{metric.label}</span>
                              <span>{metric.value}%</span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-slate-700">
                              <div
                                className="h-2 rounded-full bg-cyan-400"
                                style={{ width: `${metric.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-end gap-1">
                        {[28, 44, 36, 52, 68, 58].map((value, index) => (
                          <div
                            key={value + index}
                            className="w-2 rounded bg-cyan-400/80"
                            style={{ height: `${value / 2}px` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-md border border-slate-700 bg-slate-800 p-3">
                      <p className="text-xs uppercase text-slate-400">Role</p>
                      <p className="mt-1 text-slate-200">{selectedModel.role}</p>
                    </div>
                  </div>
                )}
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
