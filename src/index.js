const core = require('@actions/core');
const github = require('@actions/github');

/**
 * @param {string[]} changes
 * @param {Record<string, string[]>} domains
 * @return {string[]}
 */
const getOutput = (changes, domains) => {
    /** @type {string[]} */
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
    const domainsString = core.getInput('domains', {required: true});
    const domains = JSON.parse(domainsString);

    const token = core.getInput('token', {required: true});
    const octokit = github.getOctokit(token);

    let files = [];

    switch (github.context.eventName) {
        case 'pull_request': {
            files = await octokit.paginate(octokit.rest.pulls.listFiles.endpoint.merge({
                ...github.context.repo,
                pull_number: github.context.payload.number,
            }));

            break;
        }
        case 'push': {
            const response = await octokit.rest.repos.compareCommits({
                ...github.context.repo,
                base: github.context.payload.before,
                head: github.context.payload.after,
            });

            // @ts-expect-error THe data can be undefined
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
