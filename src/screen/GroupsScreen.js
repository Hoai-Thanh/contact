import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet, TextInput, Alert, Keyboard } from 'react-native';

import FetchContactHelper from '../helper/FetchContactHelper';
import GroupsHelper from '../helper/GroupsHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GroupsScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [value, onChangeText] = React.useState('');
  
  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    let groups = await GroupsHelper.getGroups();
    let savedLocalSelectedGroup = await GroupsHelper.getSelectedGroups();
    console.log('run run run savedLocalSelectedGroup', savedLocalSelectedGroup);
    if (savedLocalSelectedGroup && savedLocalSelectedGroup.length > 0) {
      let data = groups.map((item) => {
        let index = savedLocalSelectedGroup.findIndex(
          (data) => data.id === item.id,
        );
        item.isSelected = index > -1;
        return item;
      });
      console.log('run run run after', data);
      setGroups([...data]);
    } else {
      updateData();
    }
  };

  const createGroup = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('@userInfo');
      const user = JSON.parse(userInfo)
      let response = await fetch('http://172.17.100.14/public-api/group/create', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'user_id': user?.id
        },
        body: JSON.stringify({
          name: value,
        })
      });
      let data = await response.json();
      if (data && data?.code == 200) {
        Alert.alert(
          "Thông báo",
          "Tạo nhóm thành công",
          [
            { text: "OK", onPress: () => navigation.goBack()}
          ],
          { cancelable: false }
        );
        setModalVisible(!modalVisible)
        Keyboard.dismiss()
        FetchContactHelper.getGroups()
      } else {
        Alert.alert(data?.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const updateData = useCallback(async () => {
    let groups = await GroupsHelper.getGroups();
    let data = groups.map((item) => {
      let index = selectedGroup.findIndex((data) => data.id === item.id);
      item.isSelected = index > -1;
      return item;
    });
    console.log('');
    setGroups([...data]);
  }, [selectedGroup]);

  const selectGroup = useCallback(
    (group) => {
      let index = selectedGroup.findIndex((item) => item.id === group.id);
      if (index > -1) {
        selectedGroup.splice(index, 1);
      } else {
        selectedGroup.push(group);
      }
      console.log('selectGroup---->', selectedGroup);
      setSelectedGroup([...selectedGroup]);
      updateData();
      try {
      } catch (error) { }
    },
    [selectedGroup],
  );

  const confirmSelectedGroup = useCallback(async () => {
    try {
      console.log('confirmSelectedGroup---->', selectedGroup);
      await GroupsHelper.saveSelectedGroups(selectedGroup);
    } catch (error) { }
    navigation.goBack();
  }, [selectedGroup]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 15 }}>
        <View style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setModalVisible(!modalVisible)}>
            <Text style={{ fontSize: 18, color: 'blue' }}>Thêm nhóm</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 25, marginVertical: 5 }}>Lọc theo nhóm</Text>
      </View>
      <FlatList
        style={{ flex: 1 }}
        data={groups}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item?.id}
            style={{ flexDirection: 'row', margin: 8, alignItems: 'center' }}
            onPress={() => selectGroup(item)}>
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: item.isSelected ? '#FF7951' : 'gray',
              }}
            />
            <Text style={{ fontSize: 18, color: 'black', marginHorizontal: 12, marginVertical: 6 }}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => item?.id?.toString()}
        extraData={groups}
        ItemSeparatorComponent={() => (
          <View style={{ height: 0.3, backgroundColor: 'gray' }} />
        )}
      />
      <TouchableOpacity
        style={{
          marginVertical: 40,
          height: 40,
          backgroundColor: '#FF7951',
          justifyContent: 'center',
          minWidth: 100,
          maxWidth: 150,
          alignSelf: 'center',
          borderRadius: 8,
        }}
        onPress={confirmSelectedGroup}>
        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
          Lọc
        </Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Tên nhóm</Text>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 0.5 }}
              onChangeText={text => onChangeText(text)}
              value={value}
            />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={{ ...styles.openButton, backgroundColor: "#FF7951", marginTop: 10 }}
                  onPress={createGroup}
                >
                  <Text style={styles.textStyle}>Tạo nhóm</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <TouchableOpacity
                  style={{ ...styles.openButton, backgroundColor: "gray", marginTop: 10 }}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                  }}
                >
                  <Text style={styles.textStyle}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    width: 300,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 10
  }
});

export default GroupsScreen;
