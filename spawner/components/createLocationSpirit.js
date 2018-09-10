const getOneFromList = require('../../redis/getOneFromList')
const createInstanceId = require('../../utils/createInstanceId')

module.exports = (location, position) => {
  return new Promise (async (resolve, reject) => {
    try {
      const currentTime = Date.now()

      const spiritTemplate = await getOneFromList('spirits', 'spirit_shade')

      let baseEnergy
  
      if (spiritTemplate.energy.includes('-')) {
        const [min, max] = spiritTemplate.energy.split('-')

        baseEnergy = Math.floor(
          Math.random() * (parseInt(max, 10) - parseInt(min, 10) + 1)
        ) + parseInt(min, 10)
      }
      else {
        baseEnergy = parseInt(spiritTemplate.energy, 10)
      }

      const spirit = {
        instance: createInstanceId(),
        id: spiritTemplate.id,
        degree: spiritTemplate.degree,
        baseEnergy: baseEnergy,
        power: spiritTemplate.power,
        focus: spiritTemplate.focus,
        ward: spiritTemplate.ward,
        resilience: spiritTemplate.resilience,
        type: spiritTemplate.type,
        tier: spiritTemplate.tier,
        owner: location.instance,
        ownerDisplay: location.displayName,
        coven: '',
        player: '',
        conditions: {},
        carrying: {},
        lastAttackedBy: '',
        lastHealedBy: '',
        previousTarget: '',
        createdOn: currentTime,
        expiresOn: 0,
        position: position
      }

      spirit.energy = spirit.baseEnergy

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
