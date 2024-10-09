import { useState, useRef } from "react";
import { View, StyleSheet, Text, Image, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function Camera() {
    const [permissao, pedirPermissao] = useCameraPermissions();
    const [foto, setFoto] = useState(null);
    const cameraRef = useRef(null);
    const [mostrarFoto, setMostrarFoto] = useState(false);
    const [scanned, setScanned] = useState(false);

    if (!permissao) {
        return <View></View>;
    }
    if (!permissao.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.textoPermissao}>O aplicativo deseja utilizar a câmera.</Text>
                <Button title="Pedir Permissão" onPress={pedirPermissao} />
            </View>
        );
    }

    const tirarFoto = async () => {
        const fotoBase64 = await cameraRef.current?.takePictureAsync({
            quality: 0.5,
            base64: true
        });
        setFoto(fotoBase64);
        setMostrarFoto(true);
        await salvarFoto(fotoBase64.uri); 
    };

    const salvarFoto = async (uri) => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
            await MediaLibrary.createAssetAsync(uri);
            Alert.alert("Foto salva na galeria!");
        } else {
            Alert.alert("Permissão para acessar a galeria foi negada.");
        }
    };

    const onBarCodeScanned = (data) => {
        console.log (data.data)
        if (scanned) {
            return; 
        }
        setScanned(true);
        Alert.alert(`Código escaneado! Tipo: Dados: ${data.data}`);
    };

    return (
        <View style={styles.container}>
            {mostrarFoto ? 
                <View>
                    <Button title='Descartar Foto' onPress={setFoto(null)} />
                    <Image source={{ uri: foto.uri }} style={styles.foto} />
                </View>
                :
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                      }}
                    onBarcodeScanned={(data) => onBarCodeScanned(data)}
                >
                    <Button title='Tirar Foto' onPress={tirarFoto} />
                    {scanned && (
                        <Button title='Escanear Novo Código' onPress={() => setScanned(false)} />
                    )}
                </CameraView>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    textoPermissao: {
        textAlign: 'center',
    },
    camera: {
        flex: 1
    },
    foto: {
        width: '100%',
        height: '80%'
    }
});