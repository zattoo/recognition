# Recognition

GitHub Action to recognize subjects impact based on provided paths map.

## Inputs

### `domains`

`string`

Required. Defines domains map to be recognized. Record of string with desired output where value is paths list.

Example:

```yml
domains: '{"app": ["projects/app", "projects/common"]}'
```

### `token`

`string`

Required. GitHub token.

## Output

Projects list as JSON string.

Example: `'["app"]'`

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
      - id: recognition
        uses: zattoo/recognition@v2
        with:
          domains: '{"app": ["projects/app", "projects/common"]}'
          token: ${{github.token}}
````
