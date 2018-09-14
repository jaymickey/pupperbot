const TwitClient = require('twit')
const axios = require('axios')
const dogApiBase = 'https://dog.ceo/api/breed'


const getBreedImage = (breedName, subtype = null) => {
  let breedPath = subtype ? `${breedName}/${subtype}` : `${breedName}`
  let url = `${dogApiBase}/${breedPath}/images/random`
  return axios.get(url)
    .then((response) => {
      return axios.get(response.data.message, {
        responseType: 'arraybuffer'
      })
    })
    .then((response) =>
      Buffer.from(response.data, 'binary')
        .toString('base64'))
    .catch((error) => {
      if (error.response) {
        return null
      }
    })
}

module.exports = async (ctx, cb) => {

  const twit = new TwitClient({
    consumer_key: ctx.secrets.TwitterConsumerKey,
    consumer_secret: ctx.secrets.TwitterConsumerSecret,
    access_token: ctx.secrets.TwitterAccessToken,
    access_token_secret: ctx.secrets.TwitterAccessTokenSecret,
  })

  const sendTweet = (user, replyToId, image, message = null) => {
    let tweetBody = message ? `@${user} ${message}` : `@${user}`

    if (image) {
      twit.post('media/upload', { media_data: image }, (err, data) =>  {
        if (!err) {
          let mediaIdStr = data.media_id_string
          let altText = 'Dog image'
          let meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

          twit.post('media/metadata/create', meta_params, (err) => {
            if (!err) {
              let params = {
                status: tweetBody,
                media_ids: [mediaIdStr],
                in_reply_to_status_id: replyToId
              }
              twit.post('statuses/update', params)
            }
          })
        } else { console.log(err) }
      })
    } else {
      twit.post('statuses/update', { status: tweetBody, in_reply_to_status_id: replyToId })
    }
  }

  // Full list of dog breeds here: https://dog.ceo/dog-api/breeds-list

  const replyTo = ctx.data.user
  const dogBreed = ctx.data.body
    .trim()
    .split(' ')
    .filter(item => item.toLowerCase() != '@pupperbot_')
  const replyToId = ctx.data.url.split('/').pop()

  var image

  switch (dogBreed.length) {
    case 1: {
      let breed = dogBreed[0]
      image = await getBreedImage(breed)
      console.log(`Attempting to reply to @${replyTo} with image of ${breed}`)
      break
    }
    case 2: {
      let breed = dogBreed[1]
      let subType = dogBreed[0]
      image = await getBreedImage(breed, subType)
      console.log(`Attempting to reply to @${replyTo} with image of ${subType} ${breed}`)
      break
    }
    default: console.log('Invalid number of arguments.')
  }

  if (image) {
    sendTweet(replyTo, replyToId, image)
  } else {
    sendTweet(
      replyTo,
      replyToId,
      null,
      'Invalid breed, please see https://dog.ceo/dog-api/breeds-list for all available breeds'
    )
  }

  cb(null, 'Success')

}