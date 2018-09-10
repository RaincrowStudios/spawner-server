const getOneFromList = require('../../redis/getOneFromList')
const createInstanceId = require('../../utils/createInstanceId')
const determineWildSpiritEnergy = require('./determineWildSpiritEnergy')

module.exports = (spiritId) => {
  return new Promise (async (resolve, reject) => {
    try {
      const currentTime = Date.now()

      const spiritTemplate = await getOneFromList('spirits', spiritId)

      const spirit = {
        instance: createInstanceId(),
        id: spiritTemplate.id,
        degree: spiritTemplate.wild.degree,
        state: '',
        baseEnergy: determineWildSpiritEnergy(spiritTemplate),
        power: spiritTemplate.wild.power,
        focus: spiritTemplate.wild.focus,
        ward: spiritTemplate.wild.ward,
        resilience: spiritTemplate.wild.resilience,
        type: spiritTemplate.type,
        tier: spiritTemplate.tier,
        owner: '',
        ownerDisplay: '',
        coven: '',
        player: '',
        conditions: {},
        carrying: {},
        lastAttackedBy: '',
        lastHealedBy: '',
        previousTarget: '',
        createdOn: currentTime,
        expiresOn: spiritTemplate.wild.duration > 0 ?
          currentTime + (spiritTemplate.wild.duration * 3600000) : 0
      }

      spirit.energy = spirit.baseEnergy

      let moveOn
      if (spiritTemplate.moveFreq.includes('-')) {
        const [min, max] = spiritTemplate.moveFreq.split('-')

        moveOn = currentTime + (
          (Math.floor(
            Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1)
          ) + parseInt(min, 10)) * 1000
        )
      }
      else {
        moveOn = parseInt(spiritTemplate.moveFreq, 10)
      }

      spirit.moveOn = moveOn

      let actionOn
      if (spiritTemplate.actionFreq.includes('-')) {
        const [min, max] = spiritTemplate.actionFreq.split('-')

        actionOn = currentTime +
          (Math.floor(
            Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1)
          ) + parseInt(min, 10)) * 1000
      }
      else {
        actionOn = parseInt(spiritTemplate.actionFreq, 10)
      }

      spirit.actionOn = actionOn

      resolve(spirit)
    }
    catch (err) {
      reject(err)
    }
  })
}
