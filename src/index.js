const core = require('@actions/core');
const github = require('@actions/github');

/**
 * @param {string[]} changes
 * @param {Record<string, string[]>} domains
 * @return {string[]}
 */
const getOutput = (changes, domains) => {
    let result = [];

    Object.entries(domains).forEach(([subject, paths]) => {
        const affected = changes.some((change) => paths.some((path) => change.includes(path)));

        if (affected) {
            result.push(subject);
        }
    });

    return [...new Set(result)];
};

(async () => {
    const {pull_request} = github.context.payload;
    const domainsString = core.getInput('domains', {required: true});
    const domains = JSON.parse(domainsString);

    const token = core.getInput('token', {required: true});
    const octokit = github.getOctokit(token);

    console.log('github.context', github.context);

    let files = [];

    if (pull_request) {
        files = await octokit.paginate(octokit.rest.pulls.listFiles.endpoint.merge({
            ...github.context.repo,
            pull_number: pull_request.number,
        }));
    } else {
        const response = await octokit.rest.git.getCommit({
            ...github.context.repo,
            ref: github.context.sha,
        });

        console.log('response', response);

        files = response.files;
    }

    console.log('files', files);

    const output = getOutput(files.map(({filename}) => filename), domains);

    console.log('output', JSON.stringify(output));

    core.setOutput('projects', JSON.stringify(['app']));
})().catch((error) => {
    core.setFailed(error);
    process.exit(1);
});
