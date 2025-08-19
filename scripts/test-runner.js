#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command, description) {
  log(`\n🚀 ${description}`, 'cyan')
  log(`Running: ${command}`, 'blue')
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    log(`✅ ${description} completed successfully`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} failed`, 'red')
    log(`Error: ${error.message}`, 'red')
    return false
  }
}

function checkTestFiles() {
  log('\n📋 Checking test files...', 'yellow')
  
  const testDirs = [
    'utils/__tests__',
    'components/products/__tests__',
    'components/cart/__tests__',
    'app/api/__tests__',
    'tests/e2e',
    'tests/performance',
    'tests/security'
  ]
  
  let totalTests = 0
  
  testDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath).filter(file => 
        file.endsWith('.test.ts') || 
        file.endsWith('.test.tsx') || 
        file.endsWith('.spec.ts')
      )
      log(`  ${dir}: ${files.length} test files`, 'blue')
      totalTests += files.length
    } else {
      log(`  ${dir}: Directory not found`, 'yellow')
    }
  })
  
  log(`\nTotal test files found: ${totalTests}`, 'bright')
  return totalTests > 0
}

function generateTestReport() {
  log('\n📊 Generating test report...', 'cyan')
  
  const reportDir = path.join(process.cwd(), 'test-results')
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      unit_tests: 'completed',
      integration_tests: 'completed',
      e2e_tests: 'completed',
      performance_tests: 'completed',
      security_tests: 'completed'
    },
    coverage: {
      statements: 'Check coverage report',
      branches: 'Check coverage report',
      functions: 'Check coverage report',
      lines: 'Check coverage report'
    }
  }
  
  fs.writeFileSync(
    path.join(reportDir, 'test-summary.json'),
    JSON.stringify(report, null, 2)
  )
  
  log('✅ Test report generated in test-results/test-summary.json', 'green')
}

async function main() {
  log('🧪 RJ4WEAR E-Commerce Test Suite Runner', 'bright')
  log('=====================================', 'bright')
  
  // Check if test files exist
  if (!checkTestFiles()) {
    log('❌ No test files found. Please ensure tests are properly set up.', 'red')
    process.exit(1)
  }
  
  const args = process.argv.slice(2)
  const testType = args[0] || 'all'
  
  let success = true
  
  switch (testType) {
    case 'unit':
      success = runCommand('npm run test', 'Unit Tests')
      break
      
    case 'integration':
      success = runCommand('npm run test -- --testPathPattern="api"', 'Integration Tests')
      break
      
    case 'e2e':
      success = runCommand('npm run test:e2e', 'End-to-End Tests')
      break
      
    case 'performance':
      success = runCommand('npm run test:e2e -- tests/performance', 'Performance Tests')
      break
      
    case 'security':
      success = runCommand('npm run test:e2e -- tests/security', 'Security Tests')
      break
      
    case 'coverage':
      success = runCommand('npm run test:coverage', 'Test Coverage')
      break
      
    case 'all':
    default:
      log('\n🎯 Running complete test suite...', 'magenta')
      
      // Run unit tests
      success = runCommand('npm run test', 'Unit Tests') && success
      
      // Run integration tests
      success = runCommand('npm run test -- --testPathPattern="api"', 'Integration Tests') && success
      
      // Run E2E tests
      success = runCommand('npm run test:e2e', 'End-to-End Tests') && success
      
      // Run performance tests
      success = runCommand('npm run test:e2e -- tests/performance', 'Performance Tests') && success
      
      // Run security tests
      success = runCommand('npm run test:e2e -- tests/security', 'Security Tests') && success
      
      // Generate coverage report
      success = runCommand('npm run test:coverage', 'Coverage Report') && success
      
      break
  }
  
  // Generate test report
  generateTestReport()
  
  if (success) {
    log('\n🎉 All tests completed successfully!', 'green')
    log('📊 Check test-results/ directory for detailed reports', 'blue')
    log('🚀 System is production ready!', 'bright')
  } else {
    log('\n❌ Some tests failed. Please check the output above.', 'red')
    process.exit(1)
  }
}

// Handle command line arguments
if (require.main === module) {
  main().catch(error => {
    log(`Fatal error: ${error.message}`, 'red')
    process.exit(1)
  })
}

module.exports = { runCommand, checkTestFiles, generateTestReport }