# Contributing

## Guidelines

### Important Steps

**Before submitting a pull request, please make sure the following is done:**

1. Fork the repository and create your branch from `main`.
2. Follow the main installation steps.
3. Make your changes.
4. Make sure that the code passes linter and type checks (`yarn lint` and `yarn prettier:check`).
5. Make sure the code passes unit and end to end tests (`yarn test`).
6. Profit!

### Git Conventions

#### Pull request naming

See how a minor change to your commit message style can make you a better programmer.

Format: `<type>(<scope>): <subject>`

`<scope>` is optional

##### Example

```
feat: add hat wobble
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```

More Examples:

- `feat`: (new feature for the user, not a new feature for build script)
- `fix`: (bug fix for the user, not a fix to a build script)
- `docs`: (changes to the documentation)
- `style`: (formatting, missing semi colons, etc; no production code change)
- `refactor`: (refactoring production code, eg. renaming a variable)
- `test`: (adding missing tests, refactoring tests; no production code change)
- `chore`: (updating grunt tasks etc; no production code change)

References:

- https://www.conventionalcommits.org/
- https://seesparkbox.com/foundry/semantic_commit_messages
- http://karma-runner.github.io/1.0/dev/git-commit-msg.html
#### Branch naming

Depending on the purpose every git branch should be prefixed.

- `feature/` when adding a new feature to the application
- `bugfix/` when fixing an existing bug
- `refactor/` for refactor
- `docs/` for docs

#### Commit message

_No specific rules at this point in time (this may change in the future though), use common sense and well known good practices._

- Keep your commit message short.
- Your message should describe clearly the change.
- You may use a prefix / scope to label the change.

Following the [Conventional Commits](https://www.conventionalcommits.org/) specification is not mandatory but if you do it will be appreciated.
