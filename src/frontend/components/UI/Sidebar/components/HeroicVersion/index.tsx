import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ipcRenderer } from 'frontend/helpers'
import ContextProvider from 'frontend/state/ContextProvider'

type Release = {
  html_url: string
  name: string
  tag_name: string
  published_at: string
  type: 'stable' | 'beta'
  id: number
}

export default function AppVersion() {
  const { t } = useTranslation()
  const [appVersion, setAppVersion] = useState('')
  const [newReleases, setNewReleases] = useState<Release[]>()
  const { sidebarCollapsed } = useContext(ContextProvider)

  useEffect(() => {
    ipcRenderer
      .invoke('getAppVersion')
      .then((version) => setAppVersion(version))
  }, [])

  useEffect(() => {
    ipcRenderer
      .invoke('getLatestReleases')
      .then((releases) => setNewReleases(releases))
  }, [])

  const newStable: Release | undefined = newReleases?.filter(
    (r) => r.type === 'stable'
  )[0]
  const newBeta: Release | undefined = newReleases?.filter(
    (r) => r.type === 'beta'
  )[0]
  const shouldShowUpdates = !sidebarCollapsed && (newBeta || newStable)

  const version = sidebarCollapsed
    ? appVersion.replace('-beta', 'b')
    : appVersion

  return (
    <>
      <div className="appVersion">
        {!sidebarCollapsed && (
          <span>
            <span>{t('info.hyperplay.version', 'HyperPlay Version')}: </span>
          </span>
        )}
        <strong>{version}</strong>
      </div>
      {shouldShowUpdates && (
        <div className="newReleases">
          <span>{t('info.hyperplay.newReleases', 'Update Available!')}</span>
          {newStable && (
            <a
              title={newStable.tag_name}
              onClick={() =>
                ipcRenderer.send('openExternalUrl', newStable.html_url)
              }
            >
              {t('info.hyperplay.stable', 'Stable')} ({newStable.tag_name})
            </a>
          )}
          {newBeta && (
            <a
              title={newBeta.tag_name}
              onClick={() =>
                ipcRenderer.send('openExternalUrl', newBeta.html_url)
              }
            >
              {t('info.hyperplay.beta', 'Beta')} ({newBeta.tag_name})
            </a>
          )}
        </div>
      )}
    </>
  )
}