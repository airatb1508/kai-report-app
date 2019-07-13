import React from 'react';
import { 
	StyleSheet,
	Text,
	View,
	ScrollView,
	SafeAreaView,
	TextInput,
	TouchableOpacity,
	Image,
	Dimensions,
	ActionSheetIOS,
	Platform,
    Keyboard,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { ImagePicker, Permissions } from 'expo';
import * as Font from 'expo-font';
import FormData from 'FormData';

export default class app extends React.Component {
	state = {
		building: '',
		floar: '',
		room: '',
		comment: '',
		image: null,
        isModalVisible: false,
        isActive: false,
        isError: false,
	};

	doit = () =>{
		ActionSheetIOS.showActionSheetWithOptions({
                options: this.state.image==null ?
                    ['Отмена', 'Выбрать фото', 'Сфотографировать'] :
                    ['Отмена', 'Выбрать другое', 'Переснять', 'Удалить'],
				cancelButtonIndex: 0,
			},
			(buttonIndex) => {
				if (buttonIndex === 3){
					this.setState({ image: null })
				} if (buttonIndex === 1) {
					this.selectPicture();
				} else if (buttonIndex === 2) {
					this.takePicture();
				}
			},
		);
	};
	
	selectPicture = async () => {
		await Permissions.askAsync(Permissions.CAMERA_ROLL);
		let { cancelled, uri } = await ImagePicker.launchImageLibraryAsync({
			aspect: 1,
			allowsEditing: false,
		});
		if (Platform.OS === 'ios'){
			uri = uri.slice(7);
		}
		if (!cancelled) this.setState({ image: uri });
	};
	
	takePicture = async () => {
		await Permissions.askAsync(Permissions.CAMERA);
		const { cancelled, uri } = await ImagePicker.launchCameraAsync({
			allowsEditing: false,
		});
		this.setState({ image: uri });
	};
	
	send = () => {
		var data = new FormData();
		if (this.state.image){
			data.append("photo", {
				name: 'image.jpg',
				type: 'image/jpeg',
				uri: this.state.image,
			});
		}
		data.append('building', this.state.building);
		data.append('floar', this.state.floar);
		data.append('room', this.state.room);
		data.append('comment', this.state.comment);

		let postData = {
			method: 'POST',
			headers: { 'Accept': 'application/json',
				'Content-Type': 'multipart/form-data'
			},
			body: data,
		}

		fetch('http://192.168.1.102:3000/api/upload', postData)
        .then((response) => {
            console.log(response);
            if (response.ok){
                console.log(response.status);
                if (response.status == 200) {
                    this.clear();
                }
            } else {
                this.setState({
                    isModalVisible: true,
                    isActive: false,
                    isError: true
                });
            }
        })
        .catch((error) => { 
            if (error) {
                console.error(error); 
            }
        })
	};

    clear = () => {
        this.setState({
            building: '',
            floar: '',
            room: '',
            comment: '',
            image: null,
            isModalVisible: true,
            isActive: false,
            isError: false,
        });
        this.refs.comment.clear();
        this.refs.building.clear();
        this.refs.floar.clear();
        this.refs.room.clear();
    }

	render() {
		return (
			<View style={styles.container}>
				<SafeAreaView style={{flex: 1, alignItems: 'center'}}>
					<ScrollView style={styles.scroll}>
						<View style={styles.scrollView}>
                            <TextInput 
								placeholder={'Здание'}
                                placeholderTextColor={'#999'}
								style={styles.input}
								returnKeyType = {"next"}
								value={this.state.building}
                                ref="building"
								onChangeText={(text) => this.setState({building: text})}
                                onSubmitEditing={() => this.refs.floar.focus()}
							/>
							<TextInput 
								placeholder={'Этаж'}
                                placeholderTextColor={'#999'}
								style={styles.input}
								returnKeyType = {"next"}
								value={this.state.floar}
                                ref="floar"
								onChangeText={(text) => this.setState({floar: text})}
                                onSubmitEditing={() => this.refs.room.focus()}
							/>
							<TextInput
								placeholder={'Кабинет/Помещение'}
                                placeholderTextColor={'#999'}
								style={styles.input}
								returnKeyType = {"next"}
								value={this.state.room}
                                ref="room"
								onChangeText={(text) => this.setState({room: text})}
                                onSubmitEditing={() => this.refs.comment.focus()}
							/>
							<TextInput
								placeholder={'Описание'}
                                placeholderTextColor={'#999'}
								style={styles.input}
								returnKeyType = {"done"}
								value={this.state.comment}
                                ref="comment"
								onChangeText={(text) => this.setState({comment: text})}
							/>
                                <TouchableOpacity 
                                    onPress={
                                        this.doit
                                    } 
                                    style={{marginVertical: 4 }}
                                >
                                    <Image
                                        style={styles.image}
                                        source={this.state.image ?
                                                { uri: this.state.image } : 
                                                require('./camera.png')}
                                    />
								</TouchableOpacity>
						</View>
					</ScrollView>
					<TouchableOpacity
					    style={styles.button}
                        onPress={() => {
                            this.send();
                            this.setState({
                                isActive: !this.state.isActive
                            })
                        } }
					>
                        {!this.state.isActive ? (
                            <Text 
                                visible={!this.state.isActive}
                                style={[
                                    styles.buttonText,
                                ]}
                            >
                                Отправить
                            </Text>
                        ) : (
                            <ActivityIndicator/>
                        )}
					</TouchableOpacity>
                    <Modal
                        visible={this.state.isModalVisible}    
                        transparent={true}
                        animationType={"fade"}
                        onrequestclose={ () => { this.setState({
                            isModalVisible: !this.state.isModalVisible
                        }) }} 
                    >
                        <View style={styles.offset}>
                            <View style={styles.modal}>
                                <View style={styles.modalTop}>
                                    <View style={styles.modalImageView}>
                                        <Image source={
                                                !this.state.isError ? require('./thanks.png')
                                                                    : require('./cross.png')
                                            }
                                            style={styles.thanksImage}
                                            resizeMode='contain'
                                        />
                                    </View>
                                    <Text style={styles.modalH1}>
                                        {!this.state.isError ?
                                            'Готово' : 'Ошибка'
                                        }
                                    </Text>
                                    <Text style={styles.modalP}>
                                        {!this.state.isError ? 
                                            'Ваша жалоба скоро будет рассмотрена.' :
                                            'Пожалуста, попробуйте позже.'
                                        }
                                    </Text>
                                </View>
                                <View style={styles.modalBottom}>
                                    <TouchableOpacity style={styles.modalCloseButton}
                                    onPress={() => {
                                        this.setState({isModalVisible: false})
                                    }}>
                                        <Text style={styles.modalCloseButtonText}>
                                            Закрыть 
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
				</SafeAreaView>
			</View>
		);
	}
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 12,
		paddingTop: 15,
		backgroundColor: '#eceef1',
	},
    input: {
        backgroundColor: '#f5f5f5',
        borderWidth: 0,
        marginBottom: 18, 
        height: 38,
        borderRadius: 9,
        width: '100%',
        paddingHorizontal: 10,
        maxWidth: 500,
    },
    title:{
        fontSize: 14,
        color: '#444',
    },
    buttonView:{
        flex: 1,
        alignItems: 'center',
        height: 0,
        backgroundColor: '#fff0',
    },
	button: {
		backgroundColor: '#5178bd',
		height: 40,
		width: '70%',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
        marginBottom: 20,
	},
	buttonText:{
		color: '#fff',
	},
    scroll:{
        width: '100%',
        flex: 1,
    },
	scrollView: {
		flex: 1,
		flexDirection: 'column',
		flexWrap: 'wrap',
		justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
	},
	image: { 
		width: 64,
		height: 64, 
		backgroundColor: '#9eadc2',
		borderRadius: 32,
	},
    offset: {
        backgroundColor: '#0005',
        height: '100%',
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modal: {
        flex: 0.5,
        justifyContent: 'space-between',
        flexDirection: 'column',
        width: '64%',
        backgroundColor: '#fff',
        overflow: 'hidden',
        borderRadius: 4,
        paddingHorizontal: 20,
    },
    modalTop:{
        flexDirection: 'column',
        paddingVertical: 20,
    },
    modalH1:{
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        fontSize: 20,
    },
    modalP:{
        textAlign: 'center',
    },
    modalBottom:{
        alignItems: 'center',
    },
    modalImageView:{
        width: '100%',
        overflow: 'hidden',
    },
    modalCloseButton:{
        padding: 15,
        width: '100%',
    },
    modalCloseButtonText:{
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
    },
    thanksImage:{
        width: '100%',
        height: 70, 
    },
});
