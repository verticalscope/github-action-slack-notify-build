const { context } = require('@actions/github');

function buildSlackAttachments({ status, color, github }) {
  const { payload, ref, workflow, eventName } = github.context;
  const { owner, repo } = context.repo;
  const event = eventName;
  const branch = event === 'pull_request' ? payload.pull_request.head.ref : ref.replace('refs/heads/', '');

  const sha = event === 'pull_request' ? payload.pull_request.head.sha : github.context.sha;
  const runId = parseInt(process.env.GITHUB_RUN_ID, 10);

  const referenceLink =
    event === 'pull_request'
      ? {
          title: 'Pull Request',
          value: `<${payload.pull_request.html_url} | ${payload.pull_request.title}>`,
          short: true,
        }
      : {
          title: 'Branch',
          value: `<https://github.com/${owner}/${repo}/commit/${sha} | ${branch}>`,
          short: true,
        };

  return [
    {
      color,
      fields: [
        {
          title: 'Repo',
          value: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
          short: true,
        },
        {
          title: 'Workflow',
          value: `<https://github.com/${owner}/${repo}/actions/runs/${runId} | ${workflow}>`,
          short: true,
        },
        {
          title: 'Status',
          value: status,
          short: true,
        },
        referenceLink,
        {
          title: 'Event',
          value: event,
          short: true,
        },
      ],
      footer_icon: 'https://github.githubassets.com/favicon.ico',
      footer: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
      ts: Math.floor(Date.now() / 1000),
    },
  ];
}

module.exports.buildSlackAttachments = buildSlackAttachments;

function formatChannelName(channel) {
  return channel.replace(/[#@]/g, '');
}

module.exports.formatChannelName = formatChannelName;

function buildSlackBlocks({ title, status, color, github }) {
  const { payload, ref, workflow, eventName } = github.context;
  const { owner, repo } = context.repo;
  const branch = eventName === 'pull_request' ? payload.pull_request.head.ref : ref.replace('refs/heads/', '');

  const sha = eventName === 'pull_request' ? payload.pull_request.head.sha : github.context.sha;
  const runId = parseInt(process.env.GITHUB_RUN_ID, 10);

  console.log(payload);
  const msg = eventName === 'pull_request' ? payload.pull_request.body : payload.push.commits[0].message;

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: title,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Status:*\n${status}`,
        },
        {
          type: 'mrkdwn',
          text: `*Workflow*:\n<https://github.com/${owner}/${repo}/actions/runs/${runId} | ${workflow}>`,
        },
      ],
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Repo:*\n<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
        },
        {
          type: 'mrkdwn',
          text: `*Branch*:\n<https://github.com/${owner}/${repo}/commit/${sha} | ${branch}>`,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: msg,
        },
      ],
    },
  ];
}

module.exports.buildSlackBlocks = buildSlackBlocks;
