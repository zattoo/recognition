const core = require('@actions/core');
const github = require('@actions/github');

/**
 * @param {string[]} changes
 * @param {string[]} projects
 * @return {string[]}
 */
const getOutput = (changes, projects) => {
    if (changes.some((change) => change.includes('projects/common'))) {
        return projects;
    }

    return projects.reduce((result, project) => {
        if (!changes.some((change) => change.includes(`projects/${project}`))) {
            return result;
        }

        result = [...result, project];

        return result;
    }, []);
};

(async () => {
    const {pull_request} = github.context.payload;

    if (!pull_request) {
        core.error('Only pull requests events can trigger this action');
    }

    const projects = JSON.parse(core.getInput('projects', {required: true}));

    if (!Array.isArray(projects)) {
        core.error('Projects list is not defined');
    }

    const token = core.getInput('token', {required: true});
    const octokit = github.getOctokit(token);

    const response = await octokit.paginate(octokit.rest.pulls.listFiles.endpoint.merge({
        ...github.context.repo,
        pull_number: pull_request.number,
    }));

    const output = getOutput(response.map(({filename}) => filename), projects);

    console.log('output', JSON.stringify(output));

    core.setOutput('projects', JSON.stringify(output));
})().catch((error) => {
    core.setFailed(error);
    process.exit(1);
});
