# Auth0 Webtask Hack

A twitter bot that replies to users who mention it along with a dog breed. It is written in Node.js and utilises the following services:

- [webtask.io](https://webtask.io)
- [IFTTT](https://ifttt.com)
- [Twitter API](https://developer.twitter.com/)
- [Dog CEO's Dog API](https://dog.ceo/dog-api)

The bot can take up to 15 minutes to reply due to polling delay with IFTTT<sup>[\[1\]](https://help.ifttt.com/hc/en-us/articles/115010194247-How-often-do-Applets-run-)</sup>

## Requirements

- [Node.js 8+](https://nodejs.org/en/)
- [Twitter account](https://twitter.com), and [developer account](https://developer.twitter.com)
- [IFTTT account](https://ifttt.com)
- [Webtask CLI](https://www.webtask.io/cli)

### Secrets

Once a Twitter developer account has been created:

- Create an app ([details](https://botwiki.org/resource/tutorial/how-to-create-a-twitter-app/))
- Retreive the consumer token & secret, and access token & secret
- Create a `secrets` file in the format of `KEY=VALUE`, one line per secret

## Deploy

`wt create --secrets-file secrets --name PupperBot webtask.js`

## License

[MIT](LICENCE)
