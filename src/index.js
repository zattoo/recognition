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

    switch (github.context.eventName) {
        case 'pull_request': {
            files = await octokit.paginate(octokit.rest.pulls.listFiles.endpoint.merge({
                ...github.context.repo,
                pull_number: pull_request.number,
            }));

            break;
        }
        case 'push': {
            const response = await octokit.rest.repos.compareCommits({
                ...github.context.repo,
                base: github.context.payload.before,
                head: github.context.payload.after,
            });

            files = response.data.files;

            break;
        }
        default:
            throw new Error(`Unsupported event: ${github.context.eventName}`);
    }

    const output = files ? getOutput(files.map(({filename}) => filename), domains) : [];

    core.setOutput('projects', JSON.stringify(output));
})().catch((error) => {
    core.setFailed(error);
    process.exit(1);
});
