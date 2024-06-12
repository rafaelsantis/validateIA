const axios = require('axios');

const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN';

class GithubHelper {
  constructor(owner, repo_name, pull_request_number) {
    this.owner = owner;
    this.repo = repo_name;
    this.pull_request_number = pull_request_number;

    this.githubApi = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

  async getPullRequestChanges() {
    try {
      // Obter arquivos modificados no pull request
      const filesResponse = await githubApi.get(`/repos/${this.owner}/${this.repo}/pulls/${this.pull_request_number}/files`);
      const filesData = filesResponse.data;

      return filesData.map(file => ({
        filename: file.filename,
        patch: file.patch
      }));
    } catch (error) {
      console.error('Erro ao recuperar as alterações do pull request:', error);
      return [];
    }
  }

}

module.exports = GithubHelper;