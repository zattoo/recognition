# Recognition

GitHub Action to recognize affected projects.

## Inputs

### `projects`

`string[]`

Required. Defines project to recognize

Example: `'["account", "app", "cast"]'`

### `token`

`string`

Required. GitHub token.

## Output

Projects list as JSON string.

Example: `'["app", "cast"]'`

## Usage

````yml
name: Recognition

jobs:
  recognition:
    name: Recognition
    runs-on: ubuntu-latest
    outputs:
        projects: ${{steps.recognition.outputs.projects}}
    steps:
      - uses: actions/checkout@v2
      - name: Recognition
        id: recognition
        uses: zattoo/recognition@v1
        with:
          projects: '["account", "app", "cast"]'
          token: ${{github.token}}
````
