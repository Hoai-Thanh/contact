import lodash from 'lodash';
import {DrawerLayoutAndroidBase} from 'react-native';
import Groups from '../constant/GroupsConstant';

export class ContactModel {
  get fullName() {
    let fullName = this.name;
    return fullName.trim();
  }

  get shortFullName() {
    let value = '';
    if (this.name.length > 0) {
      value += this.name.charAt(0);
    }
    return value.trim().toUpperCase();
  }

  get groupName() {
    if (this.group) {
      let data = Groups.find((item) => item.value === this.group);
      if (data) {
        return data.title;
      } else {
        return '';
      }
    }
  }

  constructor(contact) {
    this.id = lodash.get(contact, 'id', '');
    this.name = lodash.get(contact, 'name', '');
    this.email = lodash.get(contact, 'email', '');
    this.phone = lodash.get(contact, 'phone', '');
    this.department = lodash.get(contact, 'department', '');
    this.jobtitle = lodash.get(contact, 'jobtitle', '');
    this.friends = lodash.get(contact, 'friends', false);
    this.group = lodash.get(contact, 'group', null);
    this.groupName = lodash.get(contact, 'groupName', '');
    this.requestStatus = lodash.get(contact, 'requestStatus', 0);
  }
}
