const { deburr } = require('lodash')
const levenshtein = require('fast-levenshtein')

const clearStr = (str) => deburr(str).toLowerCase().trim()

const JOBS = [
  'Paysan',
  'Forestier',
  'Herboriste',
  'Trappeur',
  'Boulanger',
  'Ebéniste',
  'Cuisinier',
  'Pêcheur',
  'Armurier',
  'Mineur',
  'Tailleur',
  'Maroquinier',
  'Bijoutier',
  "Maitre d'Armes",
]

const CLEARED_JOBS = JOBS.map(clearStr)

const getRawForms = (texttractResult) => {
  const getValues = (keyValueSet) => {
    if (!keyValueSet.Relationships) return []

    const values = keyValueSet.Relationships.find((r) => r.Type === 'VALUE')
    if (!values) return []

    return values.Ids.flatMap((id) => {
      const relations = texttractResult.Blocks.find((b) => b.Id === id)
        .Relationships

      if (!relations) return []

      return relations.flatMap(({ Ids }) =>
        Ids.map((id) => texttractResult.Blocks.find((b) => b.Id === id).Text),
      )
    })
  }

  const getKeys = (keyValueSet) => {
    if (!keyValueSet.Relationships) return []
    return keyValueSet.Relationships.find(
      (r) => r.Type === 'CHILD',
    ).Ids.flatMap((id) => texttractResult.Blocks.find((b) => b.Id === id).Text)
  }

  return texttractResult.Blocks.map((b) => {
    if (b.BlockType !== 'KEY_VALUE_SET') return undefined

    const keys = getKeys(b)
    const values = getValues(b)
    if (keys.length <= 0 || values.length <= 0) return undefined

    const keyStr = keys.join(' ')
    const valueStr = values.join(' ')
    if (keyStr.trim().length <= 0 || valueStr.trim().length <= 0) {
      return undefined
    }

    return {
      key: keyStr,
      value: valueStr,
    }
  }).filter(Boolean)
}

const getRawTable = (texttractResult) => {
  const findSameRowBlocks = (rowIndex) =>
    texttractResult.Blocks.filter(
      (b) =>
        b.BlockType === 'CELL' && b.Relationships && b.RowIndex === rowIndex,
    )

  return texttractResult.Blocks.filter(
    (b) => b.BlockType === 'CELL' && b.ColumnIndex === 1 && b.Relationships,
  ).map((b) =>
    findSameRowBlocks(b.RowIndex).flatMap((b) =>
      b.Relationships.flatMap(({ Ids }) =>
        Ids.map((id) => texttractResult.Blocks.find((b) => b.Id === id).Text),
      ),
    ),
  )
}

const extractNumber = (str) => {
  if (!str) return undefined

  const matches = str.match(/(\d+)/)
  if (!matches) return undefined

  return +matches[0]
}

const extractLvl = (str) => {
  if (!str || !str.replace) return undefined

  // remove NIV.
  let clearedStr = str.replace(/N?I?V\./gi, '')
  // sometimes 0 are confused with O by textextract
  clearedStr = clearedStr.replace(/O/gi, '0')

  return extractNumber(clearedStr)
}

export const getJobsLvl = (texttractResult) => {
  const forms = getRawForms(texttractResult).map(({ key, value }) => ({
    code: key,
    value: extractLvl(value),
  }))
  const formsJobs = JOBS.map((code) => ({ code, lvl: undefined }))
  forms.forEach((form, rowIndex) => {
    const clearedStr = clearStr(form.code)
    const closestJob = CLEARED_JOBS.map((code) => [
      code,
      levenshtein.get(code, clearedStr),
    ]).sort((a, b) => a[1] - b[1])[0]

    if (closestJob[0].length * 0.1 < closestJob[1]) {
      return
    }

    const lvl = extractLvl(form.value)

    const formJob = formsJobs.find(
      ({ code }) => clearStr(code) === clearStr(closestJob[0]),
    )
    if (!formJob.lvl || (lvl && formJob.lvl < lvl)) {
      formJob.lvl = lvl
    }
  })

  const table = getRawTable(texttractResult)
  const tableJobs = JOBS.map((code) => ({ code, lvl: undefined }))

  table.forEach((row, rowIndex) => {
    // for each column find the closest job association
    const closestJobAssociation = row
      .map((columnStr, index) => {
        const clearedStr = clearStr(columnStr)

        return [
          columnStr,
          index,
          CLEARED_JOBS.map((code) => [
            code,
            levenshtein.get(code, clearedStr),
          ]).sort((a, b) => a[1] - b[1])[0],
        ]
      })
      .sort((a, b) => a[2][1] - b[2][1])[0]

    // if this closest job association has more thant 10% of its characters wrong,
    // then the current row do not represent a job
    if (closestJobAssociation[0].length * 0.1 < closestJobAssociation[2][1]) {
      return
    }

    const lvl = extractLvl(row[closestJobAssociation[1] + 1])

    const tableJob = tableJobs.find(
      ({ code }) => clearStr(code) === clearStr(closestJobAssociation[2][0]),
    )
    if (!tableJob.lvl || (lvl && tableJob.lvl < lvl)) {
      tableJob.lvl = lvl
    }
  })

  // for each word if it match 90% of a job name we try to find the lvl in next word
  const wordJobs = JOBS.map((code) => ({ code, lvl: undefined }))
  texttractResult.Blocks.filter((b) => b.BlockType === 'WORD').forEach(
    (b, index, blocks) => {
      if (index >= blocks.length) return

      const clearedStr = clearStr(b.Text)
      const closestJob = CLEARED_JOBS.map((code) => [
        code,
        levenshtein.get(code, clearedStr),
      ]).sort((a, b) => a[1] - b[1])[0]

      if (closestJob[0].length * 0.1 < closestJob[1]) {
        return
      }

      const lvl = extractLvl(blocks[index + 1].Text)

      const wordJob = wordJobs.find(
        ({ code }) => clearStr(code) === clearStr(closestJob[0]),
      )
      if (!wordJob.lvl || (lvl && wordJob.lvl < lvl)) {
        wordJob.lvl = lvl
      }
    },
  )

  const getLvl = (code) =>
    [
      formsJobs.find((b) => b.code === code).lvl,
      tableJobs.find((b) => b.code === code).lvl,
      wordJobs.find((b) => b.code === code).lvl,
    ]
      .filter(Boolean)
      .sort((a, b) => b - a)[0]

  const jobs = JOBS.map((code) => ({ code, lvl: getLvl(code) }))

  return {
    formsJobs,
    tableJobs,
    wordJobs,
    jobs,
  }
}
