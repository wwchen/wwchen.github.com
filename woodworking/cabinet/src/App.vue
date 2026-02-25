<template>
  <div class="container">
    <h1>Cabinet Maker Pro</h1>
    <div class="status">
      <h2>TypeScript + Vue 3 + Vite Migration</h2>
      <div class="phase">
        <h3>✓ Phase 1: Infrastructure Setup Complete</h3>
        <ul>
          <li>✓ Vite + Vue 3 + TypeScript configured</li>
          <li>✓ ESLint + Prettier + Husky pre-commit hooks</li>
          <li>✓ Vitest testing framework</li>
          <li>✓ GitHub Actions CI/CD pipeline</li>
          <li>✓ JSON config files moved to src/data/</li>
        </ul>
      </div>
      <div class="phase">
        <h3>⏳ Phase 2: Code Migration (Next)</h3>
        <ul>
          <li>⏳ TypeScript interfaces for all data structures</li>
          <li>⏳ Expression evaluator service (replace eval())</li>
          <li>⏳ Vue 3 Composition API components</li>
          <li>⏳ Three.js integration with Vue lifecycle</li>
          <li>⏳ Comprehensive unit tests</li>
        </ul>
      </div>
      <div class="info">
        <p><strong>Current app:</strong> The original index.html is still available and working.</p>
        <p><strong>Next steps:</strong> Run <code>npm install</code> and <code>npm run dev</code> to start development.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-size: 2.5rem;
}

.status {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #34495e;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}

.phase {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #42b983;
}

.phase h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.phase ul {
  list-style: none;
  padding: 0;
}

.phase li {
  padding: 0.5rem 0;
  color: #555;
  font-size: 0.95rem;
}

.info {
  background: #e3f2fd;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.info p {
  margin: 0.5rem 0;
  color: #1565c0;
}

code {
  background: #263238;
  color: #aed581;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}
</style>
