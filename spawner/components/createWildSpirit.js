const getOneFromHash = require('../../redis/getOneFromHash')

module.exports = (spiritId) => {
  return new Promise (async (resolve, reject) => {
    try {
      const currentTime = Date.now()

      const spiritTemplate = await getOneFromHash('list:spirits', spiritId)

      const spirit = {}
      spirit.id = spiritTemplate.id

      spirit.degree = spiritTemplate.wild.degree

      spirit.baseEnergy = spiritTemplate.wild.energy

      spirit.energy = spiritTemplate.wild.energy

      spirit.power = spiritTemplate.wild.power

      spirit.resilience = spiritTemplate.wild.resilience

      spirit.reach = spiritTemplate.wild.reach

      spirit.type = spiritTemplate.type

      spirit.tier = spiritTemplate.tier

      spirit.drop = spiritTemplate.wild.drop
      spirit.bounty = spiritTemplate.wild.bounty

      spirit.owner = ''
      spirit.ownerDisplay = ''
      spirit.coven = ''
      spirit.player = ''
      spirit.conditions = []
      spirit.carrying = []
      spirit.lastAttackedBy = ''
      spirit.lastHealedBy = ''
      spirit.previousTarget = ''

      spirit.createdOn = currentTime

      spirit.expireOn = spiritTemplate.wild.duration > 0 ?
        currentTime + (spiritTemplate.wild.duration * 3600000) : 0

      let moveOn
      if (spirit.moveFreq.includes('-')) {
        const range = spirit.moveFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        moveOn = currentTime +
          ((Math.floor(Math.random() * (max - min + 1)) + min) * 1000)
      }
      else {
        moveOn = parseInt(spirit.moveFreq, 10)
      }

      spirit.moveOn = moveOn

      let actionOn
      if (spirit.moveFreq.includes('-')) {
        const range = spirit.moveFreq.split('-')
        const min = parseInt(range[0], 10)
        const max = parseInt(range[1], 10)

        actionOn = currentTime +
          ((Math.floor(Math.random() * (max - min + 1)) + min) * 1000)
      }
      else {
        actionOn = parseInt(spirit.moveFreq, 10)
      }

      spirit.actionOn = actionOn

      resolve(spirit)
    }
    catch (err) {
      reject(err)
    }
  })
}
