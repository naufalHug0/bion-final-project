import React from 'react'

const useAlert = () => {
    const [alertConfig, setAlertConfig] = React.useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    })

    const showAlert = (title, message, type = 'info', onConfirm = null) => {
        setAlertConfig({ visible: true, title, message, type, onConfirm })
    }

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }))
        if (alertConfig.onConfirm) alertConfig.onConfirm()
    }

    return {
        alertConfig,
        showAlert,
        closeAlert
    }
}

export default useAlert
