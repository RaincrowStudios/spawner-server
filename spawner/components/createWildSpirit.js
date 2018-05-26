const getOneFromHash = require('../../redis/getOneFromHash')

module.exports = (spiritId) => {
  return new Promise (async (resolve, reject) => {
    try {
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

      spirit.duration = spiritTemplate.wild.duration

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

      resolve(spirit)
    }
    catch (err) {
      reject(err)
    }
  })
}
