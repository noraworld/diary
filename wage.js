import axios from 'axios'
import { Octokit } from '@octokit/rest'

const apiKey = process.env.RESAS_API_KEY
const githubToken = process.env.GITHUB_TOKEN
const url = 'https://opendata.resas-portal.go.jp'
const endpoint = '/api/v1/municipality/wages/perYear'

const octokit = new Octokit({ auth: githubToken })
const repository = process.env.REPO
const [ owner, repo ] = repository.split('/')

const useApi = false
const man = 10000
const totalPrefectures = 47
const averageWorkingHours = 8
const averageWorkingDays = 20
const totalMonths = 12

const myAnnual = process.env.MY_ANNUAL

// https://opendata.resas-portal.go.jp/docs/api/v1/index.html
// https://opendata.resas-portal.go.jp/docs/api/v1/municipality/wages/perYear.html
async function getWagesByPrefecture(prefCode) {
  const allAgeCode = 1

  const response = await axios.get(`${url}${endpoint}?prefCode=${prefCode}&sicCode=-&simcCode=-&wagesAge=${allAgeCode}`, {
    headers: { 'X-API-KEY': apiKey }
  })
  // response.data.result.data[response.data.result.data.length - 1].value:        563.55 万円
  // response.data.result.data[response.data.result.data.length - 1].value * man: 5635500 円
  const latestWage = (response.data.result.data[response.data.result.data.length - 1].value * man)

  // 東京都: 563.55 円
  // console.info(`INFO: ${String(response.data.result.prefCode).padStart(2, '0')}: ${response.data.result.prefName}平均年収: ${latestWage.toLocaleString()}.000 円`)
  return latestWage
}

async function getAverageWage() {
  let totalWage = 0

  for (let prefCode = 1; prefCode <= totalPrefectures; prefCode++) {
    const latestWage = await getWagesByPrefecture(prefCode)
    totalWage += latestWage
  }

  const averageWage = totalWage / totalPrefectures
  // console.info(`INFO:     全国平均時給:       ${(averageWage / totalMonths / averageWorkingDays / averageWorkingHours).toLocaleString()} 円`)
  // console.info(`INFO:     全国平均日給:      ${(averageWage / totalMonths / averageWorkingDays).toLocaleString()} 円`)
  // console.info(`INFO:     全国平均月収:     ${(averageWage / totalMonths).toLocaleString()} 円`)
  // console.info(`INFO:     全国平均年収:   ${averageWage.toLocaleString()}.000 円`)

  return {
    hourly:  averageWage / totalMonths / averageWorkingDays / averageWorkingHours,
    daily:   averageWage / totalMonths / averageWorkingDays,
    monthly: averageWage / totalMonths,
    annual:  averageWage
  }
}

// from https://github.com/noraworld/daily-report-templates/issues/400 (last results from API)
function getAverageWageStub() {
  return {
    hourly:  2_185,
    daily:   17_478,
    monthly: 349_556,
    annual:  4_194_674
  }
}

function getMyWage() {
  return {
    hourly:  myAnnual * man / totalMonths / averageWorkingDays / averageWorkingHours,
    daily:   myAnnual * man / totalMonths / averageWorkingDays,
    monthly: myAnnual * man / totalMonths,
    annual:  myAnnual * man
  }
}

async function getIssueBody() {
  const searchQuery = process.env.SEARCH_QUERY
  const { data: searchResults } = await octokit.rest.search.issuesAndPullRequests({
    q: `${searchQuery} repo:${owner}/${repo} is:issue is:open`
  })

  if (searchResults.total_count !== 1) {
    console.log('The number of the search results is not 1.')
    process.exit(1)
  }

  return {
    number: searchResults.items[0].number,
    body: searchResults.items[0].body
  }
}

async function updateIssueBody(number, body) {
  const wage = useApi ? await getAverageWage() : getAverageWageStub()
  const updatedBody = body
    .replaceAll(/{{MY_HOURLY}}/g,       Math.round(getMyWage().hourly).toLocaleString())
    .replaceAll(/{{MY_DAILY}}/g,        Math.round(getMyWage().daily).toLocaleString())
    .replaceAll(/{{MY_MONTHLY}}/g,      Math.round(getMyWage().monthly).toLocaleString())
    .replaceAll(/{{MY_ANNUAL}}/g,       Math.round(getMyWage().annual).toLocaleString())
    .replaceAll(/{{AVERAGE_HOURLY}}/g,  Math.round(wage.hourly).toLocaleString())
    .replaceAll(/{{AVERAGE_DAILY}}/g,   Math.round(wage.daily).toLocaleString())
    .replaceAll(/{{AVERAGE_MONTHLY}}/g, Math.round(wage.monthly).toLocaleString())
    .replaceAll(/{{AVERAGE_ANNUAL}}/g,  Math.round(wage.annual).toLocaleString())
    .replaceAll(/{{DIFF_HOURLY}}/g,     Math.round(getMyWage().hourly  - wage.hourly).toLocaleString())
    .replaceAll(/{{DIFF_DAILY}}/g,      Math.round(getMyWage().daily   - wage.daily).toLocaleString())
    .replaceAll(/{{DIFF_MONTHLY}}/g,    Math.round(getMyWage().monthly - wage.monthly).toLocaleString())
    .replaceAll(/{{DIFF_ANNUAL}}/g,     Math.round(getMyWage().annual  - wage.annual).toLocaleString())

  await octokit.rest.issues.update({
    owner,
    repo,
    issue_number: number,
    body: updatedBody,
  })
}

const issue = await getIssueBody()
updateIssueBody(issue.number, issue.body)
