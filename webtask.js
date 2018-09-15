const TwitClient = require('twit')
const axios = require('axios')
const dogApiBase = 'https://dog.ceo/api/breed'


const getBreedImage = async (breedName, subtype = '') => {
  const breedPath = subtype ? `${breedName}/${subtype}` : `${breedName}`
  const url = `${dogApiBase}/${breedPath}/images/random`
  try {
    const breed = await axios.get(url)
    const breedImage = await axios.get(breed.data.message, {
      responseType: 'arraybuffer'
    })
    return Buffer.from(breedImage.data, 'binary').toString('base64')
  } catch (error) {
    return null
  }
}

module.exports = async (ctx, cb) => {

  // return immediately if @PupperBot_ isn't the first word in the tweet
  if (!ctx.query.body.startsWith('@PupperBot_')) {
    cb(null, 'Success')
    return
  }

  const sendTweet = (user, replyToId, image, message = null) => {
    const twit = new TwitClient({
      consumer_key: ctx.secrets.TwitterConsumerKey,
      consumer_secret: ctx.secrets.TwitterConsumerSecret,
      access_token: ctx.secrets.TwitterAccessToken,
      access_token_secret: ctx.secrets.TwitterAccessTokenSecret,
    })
    const tweetBody = message ? `@${user} ${message}` : `@${user}`

    if (image) {
      twit.post('media/upload', { media_data: image }, (err, data) =>  {
        if (!err) {
          const mediaIdStr = data.media_id_string
          const altText = 'Dog image'
          const meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

          twit.post('media/metadata/create', meta_params, (err) => {
            if (!err) {
              const params = {
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

  const replyTo = ctx.query.user
  const dogBreed = ctx.query.body
    .trim()
    .split(' ')
    .filter(item => item.toLowerCase() != '@pupperbot_')
  const replyToId = ctx.query.url.split('/').pop()

  let image

  switch (dogBreed.length) {
    case 1: {
      const breed = dogBreed[0]
      image = await getBreedImage(breed)
      console.log(`Attempting to reply to @${replyTo} with image of ${breed}`)
      break
    }
    case 2: {
      const breed = dogBreed[1]
      const subType = dogBreed[0]
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