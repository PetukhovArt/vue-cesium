/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-10-27 15:54:13
 * @LastEditTime: 2023-03-09 14:05:49
 * @LastEditors: zouyaoji 370681295@qq.com
 * @Description:
 * @FilePath: \vue-cesium@next\packages\components\post-processes\post-process-stage-scan\use-radar-scan.ts
 */
import { VcViewerProvider } from '@vue-cesium/utils/types'
import shaderSource from '@vue-cesium/shared/shaders/RadarScan'
export default function ($services: VcViewerProvider) {
  const webgl = options => {
    const { viewer } = $services

    const webgl2 = $services.viewer.scene.context?.webgl2
    let shaderSourceText = shaderSource
    if (!webgl2) {
      shaderSourceText = shaderSourceText.replace('in vec2 v_textureCoordinates;', 'varying vec2 v_textureCoordinates;')
      shaderSourceText = shaderSourceText.replace(/texture\(/g, 'texture2D(')
      shaderSourceText = shaderSourceText.replace(/out_FragColor/g, 'gl_FragColor')
    }
    const cartographicCenter = Cesium.Cartographic.fromCartesian(options.position, viewer.scene.globe.ellipsoid)
    const _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter, viewer.scene.globe.ellipsoid)
    const _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1)
    const _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500)
    const _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1, viewer.scene.globe.ellipsoid)
    const _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1)
    const _CartographicCenter2 = new Cesium.Cartographic(
      cartographicCenter.longitude + Cesium.Math.toRadians(0.001),
      cartographicCenter.latitude,
      cartographicCenter.height
    )
    const _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2, viewer.scene.globe.ellipsoid)
    const _Cartesian4Center2 = new Cesium.Cartesian4(_Cartesian3Center2.x, _Cartesian3Center2.y, _Cartesian3Center2.z, 1)
    const _RotateQ = new Cesium.Quaternion()
    const _RotateM = new Cesium.Matrix3()
    const _time = new Date().getTime()
    const _scratchCartesian4Center = new Cesium.Cartesian4()
    const _scratchCartesian4Center1 = new Cesium.Cartesian4()
    const _scratchCartesian4Center2 = new Cesium.Cartesian4()
    const _scratchCartesian3Normal = new Cesium.Cartesian3()
    const _scratchCartesian3Normal1 = new Cesium.Cartesian3()
    const uniforms = {
      u_scanCenterEC: function () {
        return Cesium.Matrix4.multiplyByVector(viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center)
      },
      u_scanPlaneNormalEC: function () {
        const temp = Cesium.Matrix4.multiplyByVector(viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center)
        const temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera.viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1)
        _scratchCartesian3Normal.x = temp1.x - temp.x
        _scratchCartesian3Normal.y = temp1.y - temp.y
        _scratchCartesian3Normal.z = temp1.z - temp.z
        Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal)
        return _scratchCartesian3Normal
      },
      u_radius: options.radius,
      u_scanLineNormalEC: function () {
        const temp = Cesium.Matrix4.multiplyByVector(viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center)
        const temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera.viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1)
        const temp2 = Cesium.Matrix4.multiplyByVector(viewer.camera.viewMatrix, _Cartesian4Center2, _scratchCartesian4Center2)
        _scratchCartesian3Normal.x = temp1.x - temp.x
        _scratchCartesian3Normal.y = temp1.y - temp.y
        _scratchCartesian3Normal.z = temp1.z - temp.z
        Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal)
        _scratchCartesian3Normal1.x = temp2.x - temp.x
        _scratchCartesian3Normal1.y = temp2.y - temp.y
        _scratchCartesian3Normal1.z = temp2.z - temp.z
        const tempTime = ((new Date().getTime() - _time) % options.interval) / options.interval
        Cesium.Quaternion.fromAxisAngle(_scratchCartesian3Normal, tempTime * Cesium.Math.PI * 2, _RotateQ)
        Cesium.Matrix3.fromQuaternion(_RotateQ, _RotateM)
        Cesium.Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1)
        Cesium.Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1)
        return _scratchCartesian3Normal1
      },
      u_scanColor: options.color
    }
    return {
      shaderSource: shaderSourceText,
      uniforms
    }
  }

  return {
    webgl
  }
}
