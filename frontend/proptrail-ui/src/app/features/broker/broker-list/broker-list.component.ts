import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrokerService } from '../../../core/services/broker.service';

@Component({
  selector: 'app-broker-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './broker-list.component.html',
  styleUrls: ['./broker-list.component.scss']
})
export class BrokerListComponent implements OnInit {

  brokers: any[] = [];
  searchQuery = '';
  isEditMode = false;
  selectedBrokerId = 0;

  broker = {
    firstName: '',
    lastName: '',
    mobile: '',
    email: ''
  };

  constructor(private brokerService: BrokerService) { }

  ngOnInit(): void {
    this.loadBrokers();
  }

  loadBrokers() {
    this.brokerService.getBrokers().subscribe((data: any) => {
      this.brokers = data;
    });
  }

  get filteredBrokers(): any[] {
    if (!this.searchQuery) return this.brokers;
    const q = this.searchQuery.trim().toLowerCase();
    return this.brokers.filter(b => 
      `${b.firstName} ${b.lastName}`.toLowerCase().includes(q) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.mobile && b.mobile.includes(q))
    );
  }

  addBroker() {
    if (!this.broker.firstName ||
      !this.broker.lastName ||
      !this.broker.mobile ||
      !this.broker.email) {
      alert("Please fill all fields");
      return;
    }

    if (this.broker.mobile.length !== 10) {
      alert("Mobile number must be 10 digits");
      return;
    }

    if (this.isEditMode) {
      this.updateBroker();
      return;
    }

    this.brokerService.addBroker(this.broker)
      .subscribe(() => {
        this.loadBrokers();
        this.resetForm();
        alert("Broker Added Successfully");
      });
  }

  deleteBroker(id: number) {
    if (confirm("Are you sure you want to delete this broker?")) {
      this.brokerService.deleteBroker(id).subscribe(() => {
        this.loadBrokers();
      });
    }
  }

  editBroker(broker: any) {
    this.isEditMode = true;
    this.selectedBrokerId = broker.id;

    this.broker = {
      firstName: broker.firstName,
      lastName: broker.lastName,
      mobile: broker.mobile,
      email: broker.email
    };
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.isEditMode = false;
    this.selectedBrokerId = 0;
    this.broker = {
      firstName: '',
      lastName: '',
      mobile: '',
      email: ''
    };
  }

  updateBroker() {
    this.brokerService
      .updateBroker(this.selectedBrokerId, this.broker)
      .subscribe(() => {
        this.loadBrokers();
        this.resetForm();
      });
  }

}